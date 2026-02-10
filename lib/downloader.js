const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { addLog } = require('./utils');

class Downloader {
    constructor(outputDir) {
        this.outputDir = outputDir;
        this.ytdlpPath = path.join(__dirname, '..', 'yt-dlp.exe');
    }

    async download(track, url) {
        return new Promise((resolve, reject) => {
            if (!url) return reject(new Error('No URL provided'));

            // Safe filename
            const safeTitle = track.name.replace(/[<>:"/\\|?*]/g, '');
            const safeArtist = track.artist.replace(/[<>:"/\\|?*]/g, '');
            const fileName = `${safeArtist} - ${safeTitle}.mp3`;
            const filePath = path.join(this.outputDir, fileName);

            addLog(`Starting download: ${fileName}`);

            const args = [
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '320K', // High quality
                '-f', 'bestaudio',
                '-o', filePath,
                '--no-warnings',
                '--ignore-errors',
                url
            ];

            const process = spawn(this.ytdlpPath, args);

            process.stdout.on('data', (data) => {
                // addLog(`[yt-dlp] ${data.toString()}`);
            });

            process.stderr.on('data', (data) => {
                const msg = data.toString();
                // Ignore minor warnings
                if (!msg.includes('DeprecationWarning') && !msg.includes('WARNING')) {
                    addLog(`[yt-dlp err] ${msg}`);
                }
            });

            process.on('close', (code) => {
                if (code === 0) {
                    addLog(`Download verified: ${fileName}`);
                    resolve(filePath);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}`));
                }
            });

            process.on('error', (err) => {
                reject(err);
            });
        });
    }
}

module.exports = Downloader;
