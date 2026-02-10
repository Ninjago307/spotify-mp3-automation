const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { addLog } = require('./utils');

class Tagger {
    constructor() {
        // Ensure ffmpeg path is set if needed, or assume it's in PATH or handled by fluent-ffmpeg variables
        // The project has yt-dlp, but ffmpeg might need to be verified. 
        // Usually yt-dlp needs ffmpeg to merge, so it's likely present.
    }

    async tag(filePath, metadata) {
        return new Promise(async (resolve, reject) => {
            addLog(`Tagging: ${path.basename(filePath)}`);

            const tempOutput = filePath.replace('.mp3', '_tagged.mp3');

            // Download cover art to temp file if exists
            let coverPath = null;
            if (metadata.cover) {
                try {
                    coverPath = await this.downloadCover(metadata.cover, path.dirname(filePath));
                } catch (e) {
                    addLog(`Formatting cover art failed: ${e.message}`);
                }
            }

            const command = ffmpeg(filePath);

            // Add metadata
            command.outputOptions(
                '-id3v2_version', '3',
                '-metadata', `title=${metadata.name}`,
                '-metadata', `artist=${metadata.artist}`,
                '-metadata', `album=${metadata.album || 'Spotify Download'}`
            );

            // Add cover art
            if (coverPath) {
                command.input(coverPath).outputOptions(
                    '-map', '0:0',
                    '-map', '1:0',
                    '-c', 'copy',
                    '-metadata:s:v', 'title="Album cover"',
                    '-metadata:s:v', 'comment="Cover (front)"'
                );
            } else {
                command.outputOptions('-c', 'copy');
            }

            command
                .save(tempOutput)
                .on('end', () => {
                    // Replace original with tagged
                    fs.unlinkSync(filePath);
                    if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
                    fs.renameSync(tempOutput, filePath);
                    addLog(`Tagging complete: ${path.basename(filePath)}`);
                    resolve(filePath);
                })
                .on('error', (err) => {
                    addLog(`Tagging error: ${err.message}`);
                    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                    if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
                    // We resolve anyway, tagging is optional
                    resolve(filePath);
                });
        });
    }

    downloadCover(url, dir) {
        return new Promise((resolve, reject) => {
            const dest = path.join(dir, `temp_cover_${Date.now()}.jpg`);
            const file = fs.createWriteStream(dest);
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(dest));
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => reject(err));
            });
        });
    }
}

module.exports = Tagger;
