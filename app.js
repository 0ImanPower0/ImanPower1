// Firebase SDK'larını içe aktarıyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Görseldeki Firebase Yapılandırma Bilgilerin
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

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// HTML Elemanları
const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const userDisplay = document.getElementById("user-display");

let currentUser = null;

// --- YAPAY ZEKA TÜRKÇE DİL VE KELİME HAVUZU ---
const turkceYapayZekaCevaplari = {
    "merhaba": "Merhaba! Ben İmanPower Yapay Zeka. Size nasıl yardımcı olabilirim?",
    "selam": "Selam! Harika bir gün geçirdiğini umuyorum. Ne hakkında konuşalım?",
    "nasılsın": "Çok iyiyim, teşekkürler! Türkçe dil bilgisi kurallarını ve kelimelerini incelemekle meşgulüm. Sen nasılsın?",
    "isim": "Benim adım İmanPower Yapay Zeka. Seninle çalışmak için sabırsızlanıyorum!",
    "noktalama": "Noktalama işaretleri, anlamın trafik polisleridir! Cümlenin akışını düzenler ve karışıklığı önlerler.",
    "varsayılan": "Bu kelimeyi henüz tam olarak öğrenemedim ama Türkçe dil bilgisi havuzuma eklemek için not alıyorum!"
};

function yapayZekaCevapVer(mesaj) {
    const temizMesaj = mesaj.toLowerCase().trim();
    
    // Kelime havuzunda kontrol et
    for (let anahtar in turkceYapayZekaCevaplari) {
        if (temizMesaj.includes(anahtar)) {
            return turkceYapayZekaCevaplari[anahtar];
        }
    }
    return turkceYapayZekaCevaplari["varsayılan"];
}

// --- KULLANICI GİRİŞ / KAYIT SİSTEMİ ---
document.getElementById("btn-register").addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Kayıt başarıyla tamamlandı!"))
        .catch(error => alert("Hata: " + error.message));
});

document.getElementById("btn-login").addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert("Giriş Hatası: " + error.message));
});

document.getElementById("btn-logout").addEventListener("click", () => {
    signOut(auth);
});

// Oturum Durumu Kontrolü (Giriş yapıldıysa sohbeti aç, eski mesajları çek)
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

// --- SOHBET VE VERİTABANI İŞLEMLERİ ---
document.getElementById("btn-send").addEventListener("click", mesajGonder);

function mesajGonder() {
    const mesajMetni = chatInput.value.trim();
    if (mesajMetni === "" || !currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + currentUser.uid);
    const yeniMesajRef = push(chatRef);

    // Kullanıcı mesajı
    set(yeniMesajRef, {
        gonderen: "kullanici",
        mesaj: mesajMetni,
        zaman: Date.now()
    });

    // Yapay Zeka Cevabı
    const botCevabi = yapayZekaCevapVer(mesajMetni);
    const yeniBotMesajRef = push(chatRef);
    set(yeniBotMesajRef, {
        gonderen: "yapayzekas",
        mesaj: botCevabi,
        zaman: Date.now()
    });

    chatInput.value = "";
}

function eskiSohbetleriYukle(uid) {
    const chatRef = ref(database, 'sohbetler/' + uid);
    onValue(chatRef, (snapshot) => {
        chatBox.innerHTML = "";
        const veriler = snapshot.val();
        if (veriler) {
            Object.values(veriler).forEach(veri => {
                const mesajElement = document.createElement("div");
                mesajElement.classList.add("mesaj", veri.gonderen);
                mesajElement.innerText = (veri.gonderen === "kullanici" ? "Siz: " : "AI: ") + veri.mesaj;
                chatBox.appendChild(mesajElement);
            });
            chatBox.scrollTop = chatBox.scrollHeight; // Ekranı aşağı kaydır
        }
    });
}
