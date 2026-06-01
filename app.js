// GitHub Pages uyumlu güncel Firebase 10.x SDK'ları
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Yapılandırman
const firebaseConfig = {
    apiKey: "AIzaSyDy4ZUv_wZsntWSIDbcolvpqDTBvWuSdrk",
    authDomain: "imanpowerveri.firebaseapp.com",
    databaseURL: "https://imanpowerveri-default-rtdb.firebaseio.com",
    projectId: "imanpowerveri",
    storageBucket: "imanpowerveri.firebasestorage.app",
    messagingSenderId: "891464029314",
    appId: "1:891464029314:web:581bd3b2ed3d7c6af2d09b",
    measurementId: "G-4T6XSDBDL5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Elemanları Tanımla
const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const userDisplay = document.getElementById("user-display");

let currentUser = null;

// --- DEV TÜRKÇE SÖZLÜK VE KURAL MOTORU ---
const kelimeMotoru = {
    // 1. GENEL KAVRAMLAR VE SÖZLÜK
    "kitap": "Bilgi, eğlence ve kültür kaynağı olan basılı eser.",
    "kalem": "Yazı yazmaya yarayan araç.",
    "öğrenci": "Eğitim kurumlarında okuyan kimse.",
    "öğretmen": "Bilgi öğreten, rehberlik eden kişi.",
    "okul": "Eğitim ve öğretimin yapıldığı yer.",
    "dünya": "Üzerinde yaşadığımız gezegen.",
    "yapay zeka": "İnsan zekasını taklit eden bilgisayar sistemleri.",
    "teknoloji": "Bilimin uygulamalı yönü.",

    // 2. 7. SINIF TÜRKÇE DİL KİTABI KONULARI
    "fiiller": "Eylemleri bildirir. İş, oluş ve durum olarak ayrılırlar.",
    "haber kipleri": "Zaman bildiren kiplerdir: Şimdiki zaman, geçmiş zaman, gelecek zaman ve geniş zaman.",
    "dilek kipleri": "Zaman bildirmeyen kiplerdir: İstek, şart, gereklilik ve emir.",
    "anlam kayması": "Bir zaman ekinin başka bir zaman yerine kullanılmasıdır.",
    "ek fiil": "İsimleri yüklem yapan veya basit zamanlı fiilleri birleşik zamanlı yapan eklerdir.",
    "zarflar": "Fiilleri niteleyen sözcüklerdir (Nasıl? Ne zaman? gibi sorulara cevap verirler).",
    "noktalama işaretleri": "Cümlenin yapısını ve anlamını düzenleyen işaretlerdir.",

    // 3. SELAMLAŞMA VE SOHBET
    "merhaba": "Merhaba! Sana nasıl yardımcı olabilirim?",
    "selam": "Selam! Seninle konuşmak harika.",
    "nasılsın": "Çok iyiyim, Türkçe kelimeleri analiz ediyorum. Sen nasılsın?",
    "günaydın": "Günaydın! Harika bir gün dilerim.",
    "iyi akşamlar": "İyi akşamlar, umarım günün güzel geçmiştir.",

    // 4. DUYGULAR VE DURUMLAR
    "mutlu": "Mutluluk harika bir duygudur!",
    "üzgün": "Üzülme, her sorunun bir çözümü vardır.",
    "yorgun": "Biraz dinlenmek sana iyi gelebilir.",
};

// --- GELİŞMİŞ ANALİZ FONKSİYONU ---
function akilliCevapUret(mesaj) {
    const m = mesaj.toLowerCase().trim();

    // Tam eşleşme kontrolü
    for (let kelime in kelimeMotoru) {
        if (m.includes(kelime)) {
            return kelimeMotoru[kelime];
        }
    }

    // Ek Analizi ve Yapısal Tahmin (Yapay Zeka Mantığı)
    if (m.endsWith("mı") || m.endsWith("mi") || m.endsWith("mu") || m.endsWith("mü")) {
        return "Harika bir soru! Ama bunu biraz daha detaylandırabilir misin?";
    }
    
    if (m.includes("nedir") || m.includes("ne demek")) {
        return "Sorduğun kavramı Türkçe dil havuzumda geliştiriyorum. Çok yakında tam tanımını yapabileceğim!";
    }

    if (m.length < 3) return "Daha uzun cümleler kurarsan seni daha iyi anlayabilirim!";

    return "Bu kelimeyi veri havuzuma not aldım. Senin sayende her gün yeni bir Türkçe kelime öğreniyorum!";
}

// --- AUTH İŞLEMLERİ ---
document.getElementById("btn-register").addEventListener("click", () => {
    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then(() => alert("Kayıt Başarılı!"))
        .catch(e => alert("Hata: " + e.message));
});

document.getElementById("btn-login").addEventListener("click", () => {
    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .catch(e => alert("Hata: " + e.message));
});

document.getElementById("btn-logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        authContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        userDisplay.innerText = user.email;
        loadChat(user.uid);
    } else {
        currentUser = null;
        authContainer.classList.remove("hidden");
        chatContainer.classList.add("hidden");
    }
});

// --- CHAT İŞLEMLERİ ---
document.getElementById("btn-send").addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendMessage(); });

function sendMessage() {
    if (!chatInput.value.trim() || !currentUser) return;

    const userMsg = chatInput.value;
    const chatRef = ref(database, 'sohbetler/' + currentUser.uid);

    // Kullanıcı mesajı
    push(chatRef, { sender: "user", text: userMsg });

    // AI Cevabı
    const aiResponse = akilliCevapUret(userMsg);
    push(chatRef, { sender: "ai", text: aiResponse });

    chatInput.value = "";
}

function loadChat(uid) {
    onValue(ref(database, 'sohbetler/' + uid), snapshot => {
        chatBox.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(m => {
                const div = document.createElement("div");
                div.className = "mesaj " + (m.sender === "user" ? "kullanici" : "yapayzekas");
                div.innerText = (m.sender === "user" ? "Sen: " : "AI: ") + m.text;
                chatBox.appendChild(div);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}
