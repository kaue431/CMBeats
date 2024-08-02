const musicFiles = ['music/musica1.mp3', 'music/musica2.mp3', 'music/musica3.mp3'];
let currentTrackIndex = 0;

const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');

function loadTrack(index) {
    audioSource.src = musicFiles[index];
    audioPlayer.load();
    audioPlayer.play();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    loadTrack(currentTrackIndex);
}

function previousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    loadTrack(currentTrackIndex);
}

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Message sent!');
});

audioPlayer.addEventListener('ended', nextTrack);
