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

let currentIndex = null;
const audioElement = document.getElementById('audioPlayer');
const musicTitleElement = document.getElementById('musicTitle');
const musicCoverElement = document.getElementById('musicCover');
const playPauseButton = document.getElementById('playPauseButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationTimeDisplay = document.getElementById('durationTime');

// Geração dinâmica da lista de músicas
function generateMusicList() {
    const musicListElement = document.getElementById('musicList');
    musicListElement.innerHTML = ''; // Limpa a lista antes de adicionar os itens

    musicFiles.forEach((music, index) => {
        const li = document.createElement('li');
        li.textContent = music.title;
        li.classList.add('music-item');
        li.addEventListener('click', () => {
            loadMusic(index);
        });
        musicListElement.appendChild(li);
    });
}

function loadMusic(index) {
    currentIndex = index;
    const selectedMusic = musicFiles[index];
    musicTitleElement.textContent = selectedMusic.title;
    musicCoverElement.src = selectedMusic.cover;
    audioElement.src = selectedMusic.file;

    progressBar.value = 0;
    currentTimeDisplay.textContent = '0:00';
    durationTimeDisplay.textContent = '0:00';

    audioElement.play();
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    if (audioElement.paused) {
        playPauseButton.textContent = '▶️'; // Play emoji
    } else {
        playPauseButton.textContent = '⏸️'; // Pause emoji
    }
}

function togglePlayPause() {
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
    updatePlayPauseButton();
}

function updateProgress() {
    const duration = audioElement.duration;
    const currentTime = audioElement.currentTime;
    progressBar.value = (currentTime / duration) * 100;

    currentTimeDisplay.textContent = formatTime(currentTime);
    if (!isNaN(duration)) {
        durationTimeDisplay.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioElement.duration;
    audioElement.currentTime = (clickX / width) * duration;
}

// Botão "Próxima Música"
function nextMusic() {
    if (currentIndex !== null && currentIndex < musicFiles.length - 1) {
        loadMusic(currentIndex + 1);
    } else {
        loadMusic(0);
    }
}

// Botão "Música Anterior"
function prevMusic() {
    if (currentIndex !== null && currentIndex > 0) {
        loadMusic(currentIndex - 1);
    } else {
        loadMusic(musicFiles.length - 1);
    }
}

audioElement.addEventListener('timeupdate', updateProgress);
audioElement.addEventListener('ended', nextMusic);

progressBar.addEventListener('click', setProgress);
playPauseButton.addEventListener('click', togglePlayPause);
nextButton.addEventListener('click', nextMusic);
prevButton.addEventListener('click', prevMusic);

// Chama a função para gerar a lista de músicas
generateMusicList();
