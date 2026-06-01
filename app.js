// Firebase SDK'ları (Versiyon 10.x)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Senin Firebase Bilgilerin
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

// Arayüz Elemanları
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");

// --- KODA GÖMÜLÜ DEV KELİME VE TDK ANLAMLARI MOTORU ---
const tdkHafizasi = {
    // A Harfi
    "adalet": "Hak ve hukuka uygunluk, hakkı gözetme.",
    "araba": "Tekerlekli, motorlu veya motorsuz kara taşıtı.",
    "arkadaş": "Birbirine karşı sevgi ve saygı gösterenlerden her biri, dost.",
    "ağaç": "Gövdesi odunsu, uzun yıllar yaşayan bitki.",
    "aile": "Evlilik ve kan bağına dayanan, toplumun en küçük birimi.",
    
    // B Harfi
    "bilgisayar": "Verileri işleyen, depolayan ve çok hızlı işlem yapan elektronik cihaz.",
    "bilim": "Evrenin veya olayların bir bölümünü konu olarak seçen, deneye dayanan düzenli bilgi.",
    "başarı": "Kişinin yetenekleri doğrultusunda amaca ulaşması durumu.",
    "büyük": "Boyutları normalden fazla olan, makro.",
    "bayrak": "Bir ulusun bağımsızlığını simgeleyen, renk ve biçimle özelleştirilmiş kumaş.",

    // C-Ç Harfi
    "cevap": "Bir soruya, bir isteğe verilen karşılık.",
    "canlı": "Yaşama yeteneği olan, hareket eden varlık.",
    "çocuk": "Bebeklik ile ergenlik dönemi arasındaki insan.",
    "çevre": "Bir varlığın veya insanın yaşamını sürdürdüğü dış ortam.",

    // D Harfi
    "ders": "Öğretmenin öğrencilere okulda aktardığı bilgi programı.",
    "dünya": "Üzerinde yaşadığımız, Güneş sistemindeki gezegen.",
    "dil": "İnsanların düşündüklerini ve duyduklarını bildirmek için kullandıkları kelimeler bütünü.",
    "dost": "Sevilen, güvenilen, yakın arkadaş.",
    "doğa": "Kendi kendine var olan, insan eliyle yapılmamış canlı ve cansız çevre.",

    // E Harfi
    "eğitim": "Çocukların ve gençlerin toplum standartlarına uygun olarak yetiştirilmesi süreci.",
    "enerji": "Maddede var olan, iş yapabilme yeteneği.",
    "egemenlik": "Yönetme gücü, hakimiyet.",
    "ev": "İçinde insanların yaşadığı barınak, mesken.",

    // F Harfi
    "fiil": "İş, oluş veya durum bildiren kelimeler, eylem.",
    "fikir": "Düşünce, görüş.",
    "futbol": "On birer kişilik iki takım arasında oynanan ayak topu oyunu.",
    "fırsat": "Bir şey için elverişli olan durum veya zaman.",

    // G Harfi
    "gelecek": "Daha sonra gelecek olan zaman, istikbal.",
    "güç": "Fiziksel veya zihinsel kuvvet, enerji.",
    "güneş": "Gezegenimize ısı ve ışık veren en yakın yıldız.",
    "güzel": "Göze ve gönle hoş gelen, beğenilen varlık veya durum.",

    // H Harfi
    "hayat": "Doğumdan ölüme kadar geçen süre, yaşam.",
    "hak": "Adaletin gerektirdiği veya kişiye tanıdığı yetki, kazanç.",
    "hafıza": "Öğrenilen şeyleri zihinde saklama gücü, bellek.",
    "hız": "Bir hareketlinin birim zamanda aldığı yol.",

    // İ-I Harfi
    "isim": "Varlıkları, kavramları tanımaya yarayan kelime, ad.",
    "insan": "Düşünme, konuşma ve araç yapma yeteneği olan en gelişmiş canlı.",
    "ışık": "Cisimleri görmemizi sağlayan fiziksel enerji.",
    "imanpower": "Kalitenin zirvesi, gücün, kodun ve zekanın birleştiği yer!",
    "internet": "Dünya genelindeki bilgisayar ağlarını birbirine bağlayan sistem.",

    // K Harfi
    "kalem": "Yazı yazmakta veya çizim yapmakta kullanılan araç.",
    "kitap": "Bir kenarından birleştirilerek kapaklanmış basılı kağıtlar bütünü.",
    "kelime": "Anlamı veya görevi olan en küçük dil birimi, sözcük.",
    "kültür": "Bir toplumun tarih boyunca ürettiği maddi ve manevi değerler.",
    "kılavuz": "Yol gösteren, rehberlik eden kişi veya kitap.",

    // M Harfi
    "merhaba": "Bir selamlaşma sözü; esenlik ve barış dileme.",
    "mantık": "Doğru düşünme kuralı ve bilimi.",
    "millet": "Aynı topraklar üzerinde yaşayan, aralarında dil, tarih ve kültür birliği olan insan topluluğu.",
    "mutluluk": "Bütün özlemlere eksiksiz ulaşmaktan doğan kıvanç durumu.",

    // N Harfi
    "noktalama": "Anlamın trafik polisleridir! Cümleleri düzenler ve kazaları önler.",
    "neden": "Bir şeyin olmasına yol açan sebep.",
    "nesil": "Yaklaşık aynı yıllarda doğmuş olan insanların tamamı, kuşak.",

    // O-Ö Harfi
    "okul": "Eğitim ve öğretimin sistemli olarak yapıldığı kurum, mektep.",
    "öğrenci": "Okula giderek bilgi ve beceri kazanan kimse, talebe.",
    "öğretmen": "Mesleği bilgi öğretmek ve eğ eğitmek olan kimse, muallim.",
    "ödev": "Öğrencinin okul dışında yapması için verilen çalışma.",

    // S-Ş Harfi
    "selam": "Bir kimseyle karşılaşıldığında kullanılan esenlik sözü.",
    "sıfat": "İsimlerin önüne gelerek onları niteleyen veya belirten sözcük, ön ad.",
    "sınav": "Bilgi seviyesini ölçmek için yapılan kontrol, imtihan.",
    "şehir": "Nüfusu çok olan, sanayi ve ticaretin geliştiği büyük yerleşim yeri.",

    // T Harfi
    "türkçe": "Dünyanın en zengin, en kurallı ve en güzel dillerinden biri.",
    "teknoloji": "Bilimsel bilgilerin sanayi ve pratik hayata uygulanması.",
    "tarih": "Geçmişte meydana gelen olayları yer ve zaman göstererek inceleyen bilim.",

    // Y-Z Harfi
    "yapay zeka": "İnsan zekasını taklit ederek problem çözen yazılımlar ve sistemler.",
    "zamir": "İsimlerin yerini geçici olarak tutan kelimeler, adıl.",
    "zarf": "Fiillerin, sıfatların anlamını zaman, durum veya miktar yönünden etkileyen sözcük.",
    "zaman": "Bir işin, bir oluşun içinde geçtiği veya geçeceği süre, vakit."
};

// --- YAPAY ZEKA CEVAP MANTIĞI ---
function aiCevapUret(mesaj) {
    const m = mesaj.toLowerCase().trim();

    // 1. Kelime Hafızasında Direkt Arama
    if (tdkHafizasi[m]) {
        return `**${m.toUpperCase()}** kelimesinin TDK anlamı: \n\n${tdkHafizasi[m]}`;
    }

    // 2. Cümlenin içindeki kelimeleri tek tek kontrol etme
    const kelimeler = m.split(" ");
    for(let k of kelimeler) {
        if (tdkHafizasi[k] && k.length > 2) {
            return `Cümlendeki **${k}** kelimesinin TDK anlamını buldum: \n\n${tdkHafizasi[k]}`;
        }
    }

    // 3. Genel Sohbet ve Selamlaşma Modülü
    if (m === "selam" || m === "merhaba") {
        return "Selam! Ben İmanPower AI. Dahili kelime haznem aktif! Bana 'adalet', 'bilgisayar', 'fiil' veya 'zarf' gibi kelimeler sorabilirsin.";
    }
    if (m.includes("nasılsın")) {
        return "İşlemcilerim tam güç çalışıyor! Kodlarımız harika görünüyor. Sen nasılsın?";
    }
    
    return "Bu kelimeyi veri havuzumda geliştirmeye devam ediyorum. Başka bir kelime denemek ister misin?";
}

// --- MESAJ GÖNDERME İŞLEMLERİ ---
function mesajGonder() {
    const text = chatInput.value.trim();
    if (!text || !auth.currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + auth.currentUser.uid);
    
    // Kullanıcı Mesajı
    push(chatRef, { sender: "user", text: text });

    // AI TDK Cevabı
    const cevap = aiCevapUret(text);
    push(chatRef, { sender: "ai", text: cevap });

    chatInput.value = "";
}

btnSend.addEventListener("click", mesajGonder);
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") mesajGonder(); });

// --- SOHBET AKIŞINI GETİRME ---
onAuthStateChanged(auth, user => {
    if (user) {
        onValue(ref(database, 'sohbetler/' + user.uid), snapshot => {
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
});
