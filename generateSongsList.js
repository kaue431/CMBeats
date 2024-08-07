const fs = require('fs');
const path = require('path');

// Ajuste o caminho da pasta de músicas conforme necessário
const musicDir = path.join(__dirname, 'music');
const outputFilePath = path.join(__dirname, 'songs.json');

fs.readdir(musicDir, (err, files) => {
    if (err) {
        console.error('Failed to read music directory:', err);
        return;
    }

    const songs = files.filter(file => file.endsWith('.mp3')).map(file => ({
        title: file.replace('.mp3', ''),
        src: `music/${file}`
    }));

    fs.writeFile(outputFilePath, JSON.stringify(songs, null, 2), (err) => {
        if (err) {
            console.error('Failed to write songs file:', err);
            return;
        }
        console.log('Songs file generated successfully.');
    });
});