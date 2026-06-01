import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// HTML Elemanlarını Yakalayalım
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const btnLogin = document.getElementById("btn-login"); // Giriş Butonu
const btnSignup = document.getElementById("btn-signup"); // Kayıt Butonu
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");
const chatBox = document.getElementById("chat-box");
const authScreen = document.getElementById("auth-screen");
const chatScreen = document.getElementById("chat-screen");

let tdkHafizasi = {};

// SÖZLÜK YÜKLEME
async function sozlukCek() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/mertkahyaoglu/turkish-dictionary/master/data.json");
        const data = await res.json();
        data.forEach(item => { tdkHafizasi[item.name.toLowerCase().trim()] = item.meaning; });
        console.log("Sözlük hazır!");
    } catch (e) { console.log("Sözlük yüklenemedi."); }
}
sozlukCek();

// --- KAYIT OLMA FONKSİYONU ---
if(btnSignup) {
    btnSignup.onclick = () => {
        const email = emailInput.value;
        const pass = passwordInput.value;
        createUserWithEmailAndPassword(auth, email, pass)
            .then(() => alert("Kayıt başarılı! Şimdi giriş yapabilirsin."))
            .catch(err => alert("Hata: " + err.message));
    };
}

// --- GİRİŞ YAPMA FONKSİYONU ---
if(btnLogin) {
    btnLogin.onclick = () => {
        const email = emailInput.value;
        const pass = passwordInput.value;
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => console.log("Giriş yapıldı!"))
            .catch(err => alert("Giriş hatası: " + err.message));
    };
}

// OTURUM KONTROLÜ (Giriş yapınca ekran değiştirir)
onAuthStateChanged(auth, user => {
    if (user) {
        authScreen.style.display = "none";
        chatScreen.style.display = "block";
        mesajlariYukle(user.uid);
    } else {
        authScreen.style.display = "block";
        chatScreen.style.display = "none";
    }
});

// MESAJ GÖNDERME
function mesajGonder() {
    const text = chatInput.value.trim();
    if (!text || !auth.currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + auth.currentUser.uid);
    push(chatRef, { sender: "user", text: text });

    // AI CEVABI
    const m = text.toLowerCase().trim();
    let cevap = "Bunu henüz bilmiyorum.";
    if (tdkHafizasi[m]) {
        cevap = `**${m.toUpperCase()}**: ${tdkHafizasi[m]}`;
    } else if (m === "selam") {
        cevap = "Selam! Ben İmanPower AI. Kelime sormaya ne dersin?";
    }
    
    push(chatRef, { sender: "ai", text: cevap });
    chatInput.value = "";
}

btnSend.onclick = mesajGonder;

function mesajlariYukle(uid) {
    onValue(ref(database, 'sohbetler/' + uid), snapshot => {
        chatBox.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(m => {
                const d = document.createElement("div");
                d.className = m.sender === "user" ? "mesaj kullanici" : "mesaj yapayzekas";
                d.innerText = m.text;
                chatBox.appendChild(d);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}
