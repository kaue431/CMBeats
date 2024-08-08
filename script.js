document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('audio-player');
    const playlist = document.getElementById('playlist');
    
    // Fetch the music list from the JSON file
    fetch('songs.json')
        .then(response => response.json())
        .then(songs => {
            songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song.title;
                li.setAttribute('data-src', song.src);
                li.addEventListener('click', function() {
                    document.getElementById('audio-source').src = this.getAttribute('data-src');
                    player.load();
                    player.play();
                });
                playlist.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading songs:', error));

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
});