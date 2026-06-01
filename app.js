// GitHub Pages uyumlu güncel Firebase 10.x SDK'ları
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Senin Firebase Bilgilerin
const firebaseConfig = {
    apiKey: "AIzaSyDy4ZUv_wZsntWSIDbcolvpqDTBvWuSdrk",
    authDomain: "imanpowerveri.firebaseapp.com",
    databaseURL: "https://imanpowerveri-default-rtdb.firebaseio.com",
    projectId: "imanpowerveri",
    storageBucket: "imanpowerveri.appspot.com",
    messagingSenderId: "891464029314",
    appId: "1:891464029314:web:581bd3b2ed3d7c6af2d09b",
    measurementId: "G-4T6XSDBDL5"
};

// Sistemleri Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// HTML Arayüz Elemanları
const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const userDisplay = document.getElementById("user-display");

let currentUser = null;

// --- TÜRKÇE DİL VE KELİME VERİ HAVUZU ---
const turkceYapayZekaCevaplari = {
    "merhaba": "Merhaba! Ben İmanPower Yapay Zeka. Size nasıl yardımcı olabilirim?",
    "selam": "Selam! Harika bir gün geçirdiğini umuyorum. Ne hakkında konuşalım?",
    "nasılsın": "Çok iyiyim, teşekkürler! Türkçe dil bilgisi kurallarını ve kelimelerini incelemekle meşgulüm. Sen nasılsın?",
    "isim": "Benim adım İmanPower Yapay Zeka. Seninle çalışmak için sabırsızlanıyorum!",
    "noktalama": "Noktalama işaretleri, anlamın trafik polisleridir! Cümlenin akışını düzenler ve karışıklığı önlerler.",
    "varsayılan": "Bu kelimeyi henüz tam olarak öğrenemedim ama Türkçe dil bilgisi havuzuma eklemek için not alıyorum!"
};

// Mesajı analiz edip cevap üreten fonksiyon
function yapayZekaCevapVer(mesaj) {
    const temizMesaj = mesaj.toLowerCase().trim();
    for (let anahtar in turkceYapayZekaCevaplari) {
        if (temizMesaj.includes(anahtar)) {
            return turkceYapayZekaCevaplari[anahtar];
        }
    }
    return turkceYapayZekaCevaplari["varsayılan"];
}

// --- KAYIT VE GİRİŞ SİSTEMİ OYNAYIŞI ---
document.getElementById("btn-register").addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if(email === "" || password === "") return alert("Lütfen alanları doldurun!");

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Kayıt başarıyla tamamlandı! Giriş yapılıyor..."))
        .catch(error => alert("Kayıt Hatası: " + error.message));
});

document.getElementById("btn-login").addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if(email === "" || password === "") return alert("Lütfen alanları doldurun!");

    signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert("Giriş Hatası: " + error.message));
});

document.getElementById("btn-logout").addEventListener("click", () => {
    signOut(auth);
});

// Oturum kontrolü (Giriş yapıldığında tetiklenir)
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        userDisplay.innerText = user.email;
        eskiSohbetleriYukle(user.uid);
    } else {
        currentUser = null;
        authContainer.classList.remove("hidden");
        chatContainer.classList.add("hidden");
        chatBox.innerHTML = "";
    }
});

// --- VERİTABANI SOHBET İŞLEMLERİ ---
document.getElementById("btn-send").addEventListener("click", mesajGonder);
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") mesajGonder(); });

function mesajGonder() {
    const mesajMetni = chatInput.value.trim();
    if (mesajMetni === "" || !currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + currentUser.uid);

    // 1. Kullanıcının attığı mesajı kaydet
    const yeniMesajRef = push(chatRef);
    set(yeniMesajRef, {
        gonderen: "kullanici",
        mesaj: mesajMetni,
        zaman: Date.now()
    });

    // 2. Yapay zekanın cevabını belirle ve kaydet
    const botCevabi = yapayZekaCevapVer(mesajMetni);
    const yeniBotMesajRef = push(chatRef);
    set(yeniBotMesajRef, {
        gonderen: "yapayzekas",
        mesaj: botCevabi,
        zaman: Date.now()
    });

    chatInput.value = "";
}

// Eski mesajları Firebase'den canlı olarak çeken fonksiyon
function eskiSohbetleriYukle(uid) {
    const chatRef = ref(database, 'sohbetler/' + uid);
    onValue(chatRef, (snapshot) => {
        chatBox.innerHTML = "";
        const veriler = snapshot.val();
        if (veriler) {
            Object.values(veriler).forEach(veri => {
                const mesajElement = document.createElement("div");
                mesajElement.classList.add("mesaj", veri.gonderen);
                mesajElement.innerText = (veri.gonderen === "kullanici" ? "Siz: " : "Yapay Zeka: ") + veri.mesaj;
                chatBox.appendChild(mesajElement);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}
