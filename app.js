// GitHub Pages uyumlu güncel Firebase 10.x SDK'ları
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Senin Firebase Bilgilerin (Görseldeki ayarların tam hali)
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

// --- GENİŞLETİLMİŞ AKILLI TÜRKÇE DİL VE KELİME VERİ HAVUZU ---
const turkceYapayZekaCevaplari = {
    // Selamlaşma ve Hal Hatır
    "merhaba": "Merhaba! İmanPower Yapay Zeka her zaman hizmetinde. Bugün Türkçe üzerine ne öğrenmek istersin?",
    "selam": "Selamlar! Seninle sohbet etmek harika. Türkçe dil bilgisi macera dünyasına hoş geldin!",
    "nasılsın": "Çok iyiyim, işlemcilerim tıkır tıkır çalışıyor! Türkçe kelimeleri analiz etmekle meşgulüm. Sen nasılsın?",
    "günaydın": "Günaydın! Harika, enerji dolu ve kelimelerle süslü bir gün geçirmeni dilerim.",
    "iyi akşamlar": "İyi akşamlar! Günün nasıl geçti? Gel biraz Türkçe dil bilgisi çalışalım veya sohbet edelim.",
    "iyi geceler": "İyi geceler! Tatlı rüyalar. Uyumadan önce kitap okumayı unutma, kelime hazinen gelişir!",
    "naber": "İyidir, yapay zeka modu tam gaz! Senden naber?",
    "nörüyon": "Kelime havuzumu karıştırıp duruyorum, senden naber?",
    "hey": "Hey! Dinliyorum, söyle bakalım.",

    // Kimlik ve Amaç
    "kimsin": "Ben senin için özel olarak geliştirilen, Türkçe dil bilgisine, anlam kurallarına ve kelimelerine hakim bir İmanPower Yapay Zekayım.",
    "ismin ne": "Benim adım İmanPower Yapay Zeka. Seninle GitHub ve Firebase üzerinde çalışan harika bir projeyiz!",
    "ne yaparsın": "Seninle Türkçe kelimeler, dil bilgisi kuralları (7. sınıf konuları dahil!), noktalama işaretleri hakkında konuşabilirim ve sohbet edebilirim.",
    "proje": "Bu proje, 0lmanPower0 tarafından geliştirilen, kayıt sistemli ve Türkçe dil destekli akıllı bir yapay zeka arayüzüdür.",
    "imanpower": "İmanPower! Kalitenin zirvesi, gücün ve zekanın birleştiği yer!",

    // 7. Sınıf Türkçe Dil Bilgisi & Kelime Bilgisi
    "anlamına göre fiil": "Fiiller anlamlarına göre üçe ayrılır: 1. İş (Kılış) fiili (neyi/kimi sorularına cevap verir, örn: yazmak), 2. Durum fiili (öznenin durumunu bildirir, örn: ağlamak), 3. Oluş fiili (zamanla kendiliğinden olur, örn: paslanmak).",
    "iş fiili": "İş (Kılış) fiilleri, öznenin kendi isteğiyle yaptığı ve bir nesneyi etkilediği fiillerdir. Başına 'onu' getirebilirsin. Örn: 'Onu okudu', 'Onu kırdı'.",
    "durum fiili": "Durum fiilleri, öznenin içinde bulunduğu süreci veya durumu bildirir. Başına 'onu' gelmez. Örn: 'Uyumak', 'Gülmek', 'Oturmak'.",
    "oluş fiili": "Oluş fiilleri, öznenin iradesi dışında, zamanla meydana gelen değişimi gösterir. Örn: 'Sararmak', 'Yaşlanmak', 'Paslanmak', 'Büyümek'.",
    "fiil": "Fiiller (Eylemler) iş, oluş ve hareket bildirir. Anlamlarına göre iş (kılış), oluş ve durum fiilleri olarak üçe ayrılır. Örn: Koşmak, sevmek, okumak.",
    "haber kipi": "Haber (Bildirme) Kipleri zaman anlamı taşır: 1. Görülen Geçmiş Zaman (-dı/-di), 2. Öğrenilen Geçmiş Zaman (-mış/-miş), 3. Şimdiki Zaman (-yor), 4. Gelecek Zaman (-ecek), 5. Geniş Zaman (-r/-ar/-er).",
    "dilek kipi": "Dilek (Tasarlama) Kipleri zaman anlamı taşımaz: 1. Gereklilik Kipi (-meli/-mali), 2. Koşul/Şart Kipi (-se/-sa), 3. İstek Kipi (-e/-a), 4. Emir Kipi (Eki yok!).",
    "kip kayması": "Kip kayması, bir kip ekinin kendi anlamı dışında başka bir kip yerine kullanılmasıdır. Örn: 'Nasreddin Hoca bir gün pazara iner...' (Şimdiki zaman ama geçmiş zaman kastediliyor).",
    "anlam kayması": "Fiilde Zaman (Anlam) Kayması: Fiilin aldığı kip ekiyle cümlenin kastettiği zamanın farklı olmasıdır. Örn: 'Yarın Ankara'ya gidiyorum.' (Şimdiki zaman eki kullanılmış ama gelecek zaman kastediliyor).",
    "kip": "Fiil kipleri haber (bildirme) ve dilek (tasarlama) kipleri olarak ikiye ayrılır. Haber kipleri zaman bildirirken, dilek kiplerinde zaman anlamı yoktur.",
    "durum zarfı": "Durum zarfı, fiile sorulan 'Nasıl?' sorusunun cevabıdır. Eylemin yapılış şeklini bildirir. Örn: 'Dersi dikkatle dinledi.' Nasıl dinledi? Dikkatle.",
    "zaman zarfı": "Zaman zarfı, fiile sorulan 'Ne zaman?' sorusunun cevabıdır. Örn: 'Ödevlerimi akşam yapacağım.' Ne zaman? Akşam.",
    "miktar zarfı": "Miktar (Azlık-Çokluk) zarfı, eylemin, sıfatın ya da başka bir zarfın ölçüsünü belirtir. 'Ne kadar?' sorusuna cevap verir. Örn: 'Bu sınav için çok çalıştı.' Ne kadar? Çok.",
    "yer yön zarfı": "Yer-yön zarfları ek almadan fiilin yönünü belirtir: aşağı, yukarı, içeri, dışarı, ileri, geri, beri, öte. Örn: 'İçeri girdi.' (Eğer 'içeriye' olursa eylem yönü değil isim olur!).",
    "soru zarfı": "Fiillerin anlamını soru yoluyla sınırlayan kelimelerdir: nasıl, ne zaman, niçin, neden, ne kadar... Örn: 'Bize ne zaman geleceksin?'",
    "zarf": "Zarflar (Belirteçler); fiilleri, fiilimsileri, sıfatları ya da kendi türünden kelimeleri zaman, durum, miktar, yer-yön ve soru yönünden etkileyen kelimelerdir. Örn: 'Hızlı koştu' (Durum zarfı).",
    "ek fiil": "Ek-fiil (İdi, imiş, ise, -dir), isim soylu kelimeleri yüklem yapar ya da basit zamanlı fiilleri birleşik zamanlı fiil yapar. İki görevi vardır!",
    "gerçek anlam": "Gerçek anlam, bir kelimenin aklımıza gelen ilk ve temel anlamıdır. Örn: 'Kör topal ilerliyordu' cümlesindeki kör veya 'Sıcak çay' cümlesindeki sıcak.",
    "mecaz anlam": "Mecaz anlam, kelimenin gerçek anlamından tamamen uzaklaşarak kazandığı yeni anlamdır. Örn: 'Bize çok soğuk davrandı.' (Buradaki soğuk ilgisiz anlamındadır).",
    "terim anlam": "Terim anlam; bilim, sanat, spor ya da meslek dallarına ait özel kavramları karşılayan kelimelerdir. Örn: 'Açılışta penaltı atıldı' (Spor terimi), 'Cümlenin yüklemi' (Türkçe terimi).",
    "anlam bilgisi": "Anlam bilgisi; gerçek anlam, mecaz anlam, terim anlam, eş anlamlı, zıt anlamlı ve sesteş kelimeleri kapsar.",
    "deyim": "Deyimler, genellikle gerçek anlamından uzak, kalıplaşmış ve en az iki kelimeden oluşan etkileyici sözlerdir. Örn: 'Karnı zil çalmak' (Çok acıkmak), 'Göz boyamak'.",
    "atasözü": "Atasözleri, uzun gözlem ve deneyimler sonucu söylenmiş, öğüt veren kalıplaşmış sözlerdir. Örn: 'Damlaya damlaya göl olur', 'Ağaç yaşken eğilir'.",

    // Noktalama İşaretleri (Anlamın Trafik Polisleri)
    "noktalama": "Noktalama işaretleri, anlamın trafik polisleridir! Okumayı kolaylaştırır, cümlenin akışını düzenler, kazaları (yanlış anlaşılmaları) önlerler.",
    "nokta": "Nokta (.), tamamlanmış cümlelerin sonuna, bazı kısaltmaların sonuna ve sayıların yanına sıra bildirmek için konur. Örn: Prof. Dr., 7. Sınıf.",
    "virgül": "Virgül (,), birbiri ardınca sıralanan eş görevli kelimelerin arasına, sıralı cümleleri ayırmaya ve uzun cümlelerde özneyi belirtmek için konur.",
    "iki nokta": "İki nokta (:), kendisiyle ilgili örnek verilecek veya açıklama yapılacak cümlenin sonuna konur. Örn: Kendimi takdim edeyim: İmanPower Yapay Zeka.",
    "soru işareti": "Soru işareti (?), soru eki veya soru kelimesi içeren, soru anlamı taşıyan cümlelerin sonuna konur. Örn: Sınav kaçta?",
    "ünlem": "Ünlem işareti (!), sevinç, kıvanç, acı, korku, şaşma gibi duyguları anlatan cümlelerin veya hitapların sonuna konur. Örn: Yaşasın! Hey, buraya bak!",
    "soru eki": "Türkçede soru ekleri (-mı, -mi, -mu, -mü) her zaman kendinden önceki kelimeden ayrı yazılır. Kendinden sonra gelen ekler ise soru ekine bitişik yazılır. Örn: Gelecek misin?",

    // Genel Dil Bilgisi Kelimeleri
    "isim": "Varlıkların veya kavramların adı olan kelimelerdir. Özel isim, cins isim, somut isim, soyut isim gibi türleri vardır. Örn: Berat, kitap, sevgi.",
    "sıfat": "İsimlerin önüne gelerek onları renk, şekil, durum gibi yönlerden niteleyen ya da işaret, sayı, soru, belgisizlik yönünden belirten kelimelerdir. Örn: 'Kırmızı forma', 'Üçüncü öğrenci'.",
    "zamir": "İsim olmadığı halde ismin yerini geçici olarak tutan kelimelerdir. Ben, sen, o, biz, siz, onlar, bu, şu, kim, herkes... Örn: 'Onu bana ver.'",
    "edat": "Tek başına anlamı olmayan, cümle içinde kelimeler arasında anlam ilgisi kuran sözcüklerdir: gibi, kadar, için, ile, göre, karşı...",
    "bağlaç": "Eş görevli kelimeleri veya cümleleri birbirine bağlayan kelimelerdir: ve, veya, ama, fakat, lakin, çünkü, da/de, ki...",
    "ünlem kelimesi": "Duygu, hitap veya şaşkınlık bildiren sözcüklerdir. Örn: Ah, oh, vah, ey, tüh!",
    "kılavuz": "Kılavuz kelimesi yazılırken 'ı' harfi unutulmamalıdır, 'kılavuz' şeklinde yazılır. Doğru yazımlara dikkat edelim!",
    "kitap": "Kitap okumak hayal dünyamızı ve Türkçe kelime kadromuzu en çok geliştiren etkinliktir. Her gün en az 20 sayfa okumalısın!",
    "ödev": "Ödevlerini zamanında yapmak seni başarıya ulaştırır. Yapamadığın Türkçe soruları olursa bana sorabilirsin!",
    "sınav": "Sınavlarda heyecanlanma, dikkatli oku ve özellikle paragraf sorularında ana fikre odaklan. Başarılar dilerim!",
    "ders": "Ders derste öğrenilir! Öğretmenini çok iyi dinle ve önemli yerleri defterine not et.",
    "türkçe": "Türkçe, dünyanın en zengin, en düzenli ve en güzel dillerinden biridir. Dilimizi kurallarına uygun kullanmak bir ayrıcalıktır.",

    // Teşekkür ve Vedalaşma
    "teşekkür": "Rica ederim! İmanPower Yapay Zeka her zaman seninle çalışmaktan mutluluk duyar.",
    "sağol": "Sen de sağ ol! Türkçe kelime ağımı genişletmemde bana yardım ettiğin için minnettarım.",
    "teşekkürler": "Rica ederim, görevimiz! Başka bir kelime veya kural incelemek ister misin?",
    "baybay": "Görüşmek üzere! Kodlarını kontrol etmeyi, Firebase şalterini açmayı unutma! Kendine iyi bak.",
    "hoşça kal": "Güle güle! Türkçe dil kurallarıyla kal, yeni kelimelerle tekrar gel!",
    "görüşürüz": "Görüşürüz! GitHub projemizi geliştirmeye devam edeceğiz, takipte kal!",

    // Varsayılan (Bilinmeyen Kelimeler İçin)
    "varsayılan": "Bu kelimeyi veya cümleyi şu anki Türkçe veri havuzumda tam olarak eşleştiremedim. Ancak işlemcilerime kaydettim, bir dahaki sefere senin için öğreneceğim! Bana dil bilgisi terimleri (fiil, zarf, noktalama gibi) veya selamlaşma kelimeleri yazabilirsin."
};

// Gelen mesajı tarayıp en uygun anahtar kelimenin cevabını dönen fonksiyon
function yapayZekaCevapVer(mesaj) {
    const temizMesaj = mesaj.toLowerCase().trim();
    
    // Kelime havuzundaki tüm anahtar kelimeleri tek tek kontrol et
    for (let anahtar in turkceYapayZekaCevaplari) {
        if (temizMesaj.includes(anahtar)) {
            return turkceYapayZekaCevaplari[anahtar];
        }
    }
    return turkceYapayZekaCevaplari["varsayılan"];
}

// --- KAYIT VE GİRİŞ SİSTEMİ İŞLEMLERİ ---
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

// Oturum durum kontrol mekanizması
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

// --- VERİTABANI MESAJLAŞMA SİSTEMİ ---
document.getElementById("btn-send").addEventListener("click", mesajGonder);
chatInput.addEventListener("keypress", (e) => { if(e.key === "Enter") mesajGonder(); });

function mesajGonder() {
    const mesajMetni = chatInput.value.trim();
    if (mesajMetni === "" || !currentUser) return;

    const chatRef = ref(database, 'sohbetler/' + currentUser.uid);

    // 1. Kullanıcı mesajını Firebase'e ekle
    const yeniMesajRef = push(chatRef);
    set(yeniMesajRef, {
        gonderen: "kullanici",
        mesaj: mesajMetni,
        zaman: Date.now()
    });

    // 2. Yapay Zekanın akıllı kelime havuzundan cevabı al ve veritabanına ekle
    const botCevabi = yapayZekaCevapVer(mesajMetni);
    const yeniBotMesajRef = push(chatRef);
    set(yeniBotMesajRef, {
        gonderen: "yapayzekas",
        mesaj: botCevabi,
        zaman: Date.now()
    });

    chatInput.value = "";
}

// Eski Sohbet Verilerini Firebase Realtime Database'den çeken fonksiyon
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
            chatBox.scrollTop = chatBox.scrollHeight; // Sohbet kutusunu en aşağı kaydırır
        }
    });
}
