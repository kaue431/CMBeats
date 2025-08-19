const musicFiles = [
    { title: "A era dos calvos", file: "musicas/A era dos calvos.mp3", cover: "capas/A era dos calvos.jpg" },
    { title: "A história de Viny", file: "musicas/A história de Viny.mp3", cover: "capas/A história de Viny.jpg" },
    { title: "A jojopose do Diego", file: "musicas/a jojopose do Diego.mp3", cover: "capas/a jojopose do Diego.jpg" },
    { title: "A ópera de JK", file: "musicas/A ópera de JK definitivo.mp3", cover: "capas/A ópera de JK.jpg" },
    { title: "Five Night At Aswra", file: "musicas/Five Night At Aswra.mp3", cover: "capas/Five Night At Aswra.jpg" },
    { title: "JK no multiverso", file: "musicas/JK no multiverso.mp3", cover: "capas/JK no multiverso.jpg" },
    { title: "JK Vilão", file: "musicas/JK Vilão.mp3", cover: "capas/JK Vilão.jpg" },
    { title: "Pagodinho do Gusta", file: "musicas/Pagodinho do Gusta.mp3", cover: "capas/Pagodinho do Gusta.jpg" },
    { title: "RPJado", file: "musicas/RPJado.mp3", cover: "capas/RPJado.jpg" },
    { title: "Se essa Tropa fosse minha", file: "musicas/Se essa Tropa fosse minha.mp3", cover: "capas/Se essa tropa fosse minha.jpg" },
    { title: "Soberanos do fim", file: "musicas/Soberanos do Fim.mp3", cover: "capas/Soberanos do Fim.jpg" },
    { title: "Trap do Guilherme", file: "musicas/Trap do Guilherme.mp3", cover: "capas/Trap do Guilherme.jpg" },
    { title: "Tropa", file: "musicas/Tropa.mp3", cover: "capas/Tropa.jpg" },
    { title: "Tropa 2.0", file: "musicas/Tropa 2.0.mp3", cover: "capas/Tropa 2.0.jpg" },
    { title: "Five Night At JK", file: "musicas/Five Night At JK.mp3", cover: "capas/Five Night At JK.png" }
];

let currentIndex = 0;
let isShuffle = false;
let isLoop = false;

const audio = document.getElementById('audioPlayer');
const musicTitle = document.getElementById('musicTitle');
const musicCover = document.getElementById('musicCover');
const playPauseBtn = document.getElementById('playPauseButton');
const prevBtn = document.getElementById('prevButton');
const nextBtn = document.getElementById('nextButton');
const shuffleBtn = document.getElementById('shuffleButton');
const loopBtn = document.getElementById('loopButton');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationTimeDisplay = document.getElementById('durationTime');
const volumeSlider = document.getElementById('volume');
const musicListElement = document.getElementById('musicList');

// Gerar lista de músicas
function generateMusicList() {
    musicListElement.innerHTML = '';
    musicFiles.forEach((music, index) => {
        const li = document.createElement('li');
        li.textContent = music.title;
        li.addEventListener('click', () => loadMusic(index));
        musicListElement.appendChild(li);
    });
}
generateMusicList();

// Carregar música
function loadMusic(index) {
    currentIndex = index;
    const music = musicFiles[index];
    audio.src = music.file;
    musicTitle.textContent = music.title;
    musicCover.src = music.cover;
    audio.play();
    updatePlayPauseBtn();
    updateActiveList();
}

// Destacar música tocando
function updateActiveList() {
    document.querySelectorAll('.music-list li').forEach((li, idx) => {
        li.classList.toggle('active', idx === currentIndex);
    });
}

// Atualizar botão play/pause
function updatePlayPauseBtn() {
    if(audio.paused) {
        playPauseBtn.textContent = '▶️';
        musicCover.classList.remove('playing');
    } else {
        playPauseBtn.textContent = '⏸️';
        musicCover.classList.add('playing');
    }
}

// Eventos
playPauseBtn.addEventListener('click', () => {
    audio.paused ? audio.play() : audio.pause();
    updatePlayPauseBtn();
});

prevBtn.addEventListener('click', () => {
    if(isShuffle) {
        loadMusic(Math.floor(Math.random() * musicFiles.length));
    } else {
        currentIndex = (currentIndex - 1 + musicFiles.length) % musicFiles.length;
        loadMusic(currentIndex);
    }
});

nextBtn.addEventListener('click', () => {
    if(isShuffle) {
        loadMusic(Math.floor(Math.random() * musicFiles.length));
    } else {
        currentIndex = (currentIndex + 1) % musicFiles.length;
        loadMusic(currentIndex);
    }
});

// Shuffle e loop
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? '#ff4f81' : '#fff';
});

loopBtn.addEventListener('click', () => {
    isLoop = !isLoop;
    loopBtn.style.color = isLoop ? '#ff4f81' : '#fff';
});

// Atualizar progress
audio.addEventListener('timeupdate', () => {
    progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    durationTimeDisplay.textContent = formatTime(audio.duration || 0);
});

// Arrastar progress
progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// Volume
volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
});

// Ao terminar música
audio.addEventListener('ended', () => {
    if(isLoop) {
        audio.currentTime = 0;
        audio.play();
    } else if(isShuffle) {
        loadMusic(Math.floor(Math.random() * musicFiles.length));
    } else if(currentIndex < musicFiles.length - 1) {
        nextBtn.click();
    }
});

// Formatar tempo
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Carregar primeira música
loadMusic(0);
