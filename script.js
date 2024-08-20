const musicFiles = [
    'A era dos calvos.mp3',
    'A história de Viny.mp3',
    'a jojopose do Diego.mp3',
    'A ópera de JK definitivo.mp3',
    'Forró da oratória.mp3',
    'JK no multiverso.mp3',
    'oratória.mp3',
    'Pagodinho do Gusta.mp3',
    'RPJado.mp3',
    'Trap do Guilherme.mp3',
    'Tropa.mp3',
    'Tropa 2.0.mp3'
];

let currentIndex = 0;
const audioPlayer = new Audio();
const musicList = document.getElementById('musicList');
const musicTitle = document.getElementById('musicTitle');
const playButton = document.getElementById('playButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Carregar a música
function loadMusic(index) {
    const selectedFile = musicFiles[index];
    audioPlayer.src = selectedFile;
    musicTitle.textContent = selectedFile.replace('.mp3', '');
    audioPlayer.load();
}

// Tocar a música
function playMusic() {
    audioPlayer.play();
    playButton.textContent = '⏸️';
}

// Pausar a música
function pauseMusic() {
    audioPlayer.pause();
    playButton.textContent = '▶️';
}

// Atualizar barra de progresso e tempo da música
function updateProgress() {
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percentage || 0;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationEl.textContent = formatTime(audioPlayer.duration);
}

// Formatar o tempo em minutos e segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Mudar o tempo da música ao interagir com a barra de progresso
function setProgress(e) {
    const newTime = (e.offsetX / progressBar.offsetWidth) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
}

// Eventos dos botões
playButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
});

prevButton.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : musicFiles.length - 1;
    loadMusic(currentIndex);
    playMusic();
});

nextButton.addEventListener('click', () => {
    currentIndex = currentIndex < musicFiles.length - 1 ? currentIndex + 1 : 0;
    loadMusic(currentIndex);
    playMusic();
});

audioPlayer.addEventListener('timeupdate', updateProgress);

progressBar.addEventListener('click', setProgress);

musicFiles.forEach((file, index) => {
    const listItem = document.createElement('div');
    listItem.classList.add('music-item');
    listItem.textContent = file.replace('.mp3', '');
    listItem.addEventListener('click', () => {
        currentIndex = index;
        loadMusic(currentIndex);
        playMusic();
    });
    musicList.appendChild(listItem);
});

audioPlayer.addEventListener('play', () => {
    if (musicTitle.offsetWidth > document.getElementById('musicTitleContainer').offsetWidth) {
        musicTitle.style.animation = 'scrollText 10s linear infinite';
    } else {
        musicTitle.style.animation = 'none';
    }
});

// Carregar a primeira música no início
loadMusic(currentIndex);
