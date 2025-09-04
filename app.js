// --- DATA: Surahs for each Juz ---
const JUZ_30 = [{num:78,name:'النبأ'},{num:79,name:'النازعات'},{num:80,name:'عبس'},{num:81,name:'التكوير'},{num:82,name:'الانفطار'},{num:83,name:'المطففين'},{num:84,name:'الانشقاق'},{num:85,name:'البروج'},{num:86,name:'الطارق'},{num:87,name:'الأعلى'},{num:88,name:'الغاشية'},{num:89,name:'الفجر'},{num:90,name:'البلد'},{num:91,name:'الشمس'},{num:92,name:'الليل'},{num:93,name:'الضحى'},{num:94,name:'الشرح'},{num:95,name:'التين'},{num:96,name:'العلق'},{num:97,name:'القدر'},{num:98,name:'البينة'},{num:99,name:'الزلزلة'},{num:100,name:'العاديات'},{num:101,name:'القارعة'},{num:102,name:'التكاثر'},{num:103,name:'العصر'},{num:104,name:'الهمزة'},{num:105,name:'الفيل'},{num:106,name:'قريش'},{num:107,name:'الماعون'},{num:108,name:'الكوثر'},{num:109,name:'الكافرون'},{num:110,name:'النصر'},{num:111,name:'المسد'},{num:112,name:'الإخلاص'},{num:113,name:'الفلق'},{num:114,name:'الناس'}];
const JUZ_29 = [{num:67,name:'الملك'},{num:68,name:'القلم'},{num:69,name:'الحاقة'},{num:70,name:'المعارج'},{num:71,name:'نوح'},{num:72,name:'الجن'},{num:73,name:'المزمل'},{num:74,name:'المدثر'},{num:75,name:'القيامة'},{num:76,name:'الإنسان'},{num:77,name:'المرسلات'}];

// --- DOM ELEMENTS ---
const homeView = document.getElementById('homeView');
const playerView = document.getElementById('playerView');
const juz30Btn = document.getElementById('juz30');
const juz29Btn = document.getElementById('juz29');
const surahGrid = document.getElementById('surahGrid');
const surahInfoSubtitle = document.getElementById('surahInfoSubtitle');
const toast = document.getElementById('toast');
// Player elements
const surahNameEl = document.getElementById('surahNameEl');
const ayahNumEl = document.getElementById('ayahNumEl');
const ayahTextEl = document.getElementById('ayahText');
const surahImage = document.getElementById('surahImage');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const backButton = document.getElementById('backButton');
const canvas = document.getElementById('celebrationCanvas');
const ctx = canvas.getContext('2d');

// --- APP STATE ---
let state = {
    currentJuz: localStorage.getItem('currentJuz') ? parseInt(localStorage.getItem('currentJuz')) : null,
    surahData: { ayahs: [] },
    currentAyahIndex: 0,
    isRepeating: false,
};

// --- INITIALIZATION ---
function init() {
    setupEventListeners();
    if (state.currentJuz) {
        updateJuzSelection(state.currentJuz, false);
    }
    renderSurahMap();
    showHomeView();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    juz30Btn.addEventListener('click', () => updateJuzSelection(30, true));
    juz29Btn.addEventListener('click', () => updateJuzSelection(29, true));
    backButton.addEventListener('click', showHomeView);
    // Player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', nextAyah);
    prevBtn.addEventListener('click', prevAyah);
    repeatBtn.addEventListener('click', toggleRepeat);
    audioPlayer.addEventListener('ended', onAudioEnded);
    audioPlayer.addEventListener('play', () => { playPauseBtn.textContent = '⏸'; });
    audioPlayer.addEventListener('pause', () => { playPauseBtn.textContent = '▶'; });
}

// --- VIEW MANAGEMENT ---
function showHomeView() {
    homeView.classList.add('active');
    playerView.classList.remove('active');
}

function showPlayerView() {
    homeView.classList.remove('active');
    playerView.classList.add('active');
}

// --- HOME VIEW LOGIC ---
function updateJuzSelection(juzNum, notifyUser) {
    state.currentJuz = juzNum;
    localStorage.setItem('currentJuz', juzNum);
    juz30Btn.classList.toggle('active', juzNum === 30);
    juz29Btn.classList.toggle('active', juzNum === 29);
    if (notifyUser) notify(juzNum === 30 ? 'تم تحديد: جزء عمّ 📖' : 'تم تحديد: جزء تبارك 📖');
    renderSurahMap();
}

function renderSurahMap() {
    const data = state.currentJuz === 30 ? JUZ_30 : state.currentJuz === 29 ? JUZ_29 : null;
    surahGrid.innerHTML = '';
    if (!data) {
        surahInfoSubtitle.textContent = 'اختر جزءًا أولاً لعرض السور';
        return;
    }
    surahInfoSubtitle.textContent = 'اضغط على أي سورة لبدء رحلتك';
    data.forEach(s => {
        const tile = document.createElement('div');
        tile.className = 'surah-tile';
        tile.innerHTML = `<div class="num">${s.num}</div><div class="name">${s.name}</div>`;
        tile.addEventListener('click', () => launchSurah(s.num, s.name));
        surahGrid.appendChild(tile);
    });
}

async function launchSurah(surahNum, surahName) {
    showPlayerView();
    // Reset player view
    surahNameEl.textContent = `سورة ${surahName}`;
    ayahTextEl.textContent = 'جاري التحميل...';
    surahImage.src = "https://placehold.co/800x400/1e293b/94a3b8?text=📖";
    
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
        const json = await response.json();
        if (json.code !== 200) throw new Error(json.data);
        
        state.surahData = json.data;
        if (state.surahData.number !== 1 && state.surahData.ayahs[0].text.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")) {
            state.surahData.ayahs.shift(); 
        }
        state.currentAyahIndex = 0;
        updateAyah();
      } catch (error) {
        ayahTextEl.textContent = "عفواً، حدث خطأ أثناء تحميل بيانات السورة.";
        console.error(error);
      }
}

// --- PLAYER VIEW LOGIC ---
function updateAyah() {
    if (!state.surahData.ayahs.length) return;
    const ayah = state.surahData.ayahs[state.currentAyahIndex];
    ayahTextEl.textContent = ayah.text;
    ayahNumEl.textContent = `الآية رقم ${ayah.numberInSurah}`;
    
    surahImage.src = `assets/images/${state.surahData.number}/${ayah.numberInSurah}.png`;
    surahImage.alt = `صورة توضيحية للآية ${ayah.numberInSurah} من سورة ${state.surahData.name}`;

    const surahNumPadded = String(state.surahData.number).padStart(3, '0');
    const ayahNumPadded = String(ayah.numberInSurah).padStart(3, '0');
    audioPlayer.src = `https://everyayah.com/data/Husary_Muallim_128kbps/${surahNumPadded}${ayahNumPadded}.mp3`;
    
    playAudio();
    updateNavButtons();
}

async function playAudio() {
    try { await audioPlayer.play(); } catch (err) { console.log("Auto-play was prevented."); }
}

function togglePlayPause() {
    if (audioPlayer.paused) playAudio();
    else audioPlayer.pause();
}

function onAudioEnded() {
    if (state.isRepeating) {
        audioPlayer.currentTime = 0;
        playAudio();
    } else if (state.currentAyahIndex < state.surahData.ayahs.length - 1) {
        nextAyah();
    } else {
        playPauseBtn.textContent = '▶';
        triggerCelebration(); 
    }
}

function nextAyah() {
    if (state.currentAyahIndex < state.surahData.ayahs.length - 1) {
        state.currentAyahIndex++;
        updateAyah();
    }
}

function prevAyah() {
    if (state.currentAyahIndex > 0) {
        state.currentAyahIndex--;
        updateAyah();
    }
}

function toggleRepeat() {
    state.isRepeating = !state.isRepeating;
    repeatBtn.classList.toggle('active', state.isRepeating);
}

function updateNavButtons() {
    prevBtn.disabled = state.currentAyahIndex === 0;
    nextBtn.disabled = state.currentAyahIndex === state.surahData.ayahs.length - 1;
}

// --- HELPERS & UTILS ---
function notify(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

let particles = [];
function triggerCelebration() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight; particles = [];
    const particleCount = 200, colors = ['#facc15', '#a78bfa', '#f472b6', '#38bdf8', '#e2e8f0'];
    for (let i = 0; i < particleCount; i++) {
        particles.push({ x: Math.random() * canvas.width, y: canvas.height + Math.random() * 100, radius: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], speed: Math.random() * 5 + 2, alpha: 1 });
    }
    animateCelebration();
}

function animateCelebration() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.y -= p.speed; p.alpha -= 0.01;
        if (p.alpha <= 0) particles.splice(i, 1);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`; ctx.fill();
    });
    if (particles.length > 0) requestAnimationFrame(animateCelebration);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(h) { let r=0,g=0,b=0; if(h.length==4){r="0x"+h[1]+h[1];g="0x"+h[2]+h[2];b="0x"+h[3]+h[3];}else if(h.length==7){r="0x"+h[1]+h[2];g="0x"+h[3]+h[4];b="0x"+h[5]+h[6];} return `${+r},${+g},${+b}`; }

// --- PWA Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg failed: ', err));
    });
}

// --- START THE APP ---
init();
