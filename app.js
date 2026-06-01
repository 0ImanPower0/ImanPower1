// Firebase ve Veritabanı Modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Senin Firebase Konfigürasyonun
const firebaseConfig = {
    apiKey: "AIzaSyDy4ZUv_wZsntWSIDbcolvpqDTBvWuSdrk",
    authDomain: "imanpowerveri.firebaseapp.com",
    databaseURL: "https://imanpowerveri-default-rtdb.firebaseio.com",
    projectId: "imanpowerveri",
    storageBucket: "imanpowerveri.firebasestorage.app",
    messagingSenderId: "891464029314",
    appId: "1:891464029314:web:581bd3b2ed3d7c6af2d09b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");

let tdkHafizasi = {};

// --- İNTERNETTEN SÖZLÜĞÜ ÇEKME ---
async function sozlukCek() {
    console.log("Sözlük yükleniyor...");
    try {
        // Bu linkten 50 bin kelimelik TDK verisini çekiyoruz
        const response = await fetch("https://raw.githubusercontent.com/mertkahyaoglu/turkish-dictionary/master/data.json");
        const data = await response.json();
        
        data.forEach(oge => {
            tdkHafizasi[oge.name.toLowerCase().trim()] = oge.meaning;
        });
        console.log("İmanPower TDK Sözlüğü Hazır!");
    } catch (error) {
        console.error("Sözlük yüklenirken bir hata oldu:", error);
    }
}
sozlukCek();

// --- YAPAY ZEKA CEVAP VERME SİSTEMİ ---
function cevapBul(mesaj) {
    const m = mesaj.toLowerCase().trim();

    // TDK'da var mı?
    if (tdkHafizasi[m]) {
        return `**${m.toUpperCase()}** kelimesinin TDK anlamı şudur: \n\n${tdkHafizasi[m]}`;
    }

    // Selamlaşma
    if (m === "selam" || m === "merhaba") return "Selam! Ben İmanPower AI. Bana dilediğin kelimeyi sorabilirsin.";
    if (m === "nasılsın") return "Harikayım! Kodlarım tıkır tıkır çalışıyor. Sen nasılsın?";

    return "Bu kelimeyi henüz öğrenemedim, başka bir kelime sormak ister misin?";
}

// --- MESAJ GÖNDERME ---
function mesajGonder() {
    const text = chatInput.value.trim();
    if (!text || !auth.currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + auth.currentUser.uid);
    
    // Senin mesajın
    push(chatRef, { sender: "user", text: text });

    // AI'nın TDK cevabı
    const aiCevabi = cevapBul(text);
    push(chatRef, { sender: "ai", text: aiCevabi });

    chatInput.value = "";
}

btnSend.addEventListener("click", mesajGonder);
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") mesajGonder(); });

// --- SOHBETİ EKRANDA GÖSTERME ---
onAuthStateChanged(auth, user => {
    if (user) {
        onValue(ref(database, 'sohbetler/' + user.uid), snapshot => {
            chatBox.innerHTML = "";
            const data = snapshot.val();
            if (data) {
                Object.values(data).forEach(m => {
                    const mesajDiv = document.createElement("div");
                    mesajDiv.className = m.sender === "user" ? "mesaj kullanici" : "mesaj yapayzekas";
                    mesajDiv.innerText = m.text;
                    chatBox.appendChild(mesajDiv);
                });
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        });
    }
});
