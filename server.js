require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Import Modules
const SpotifyScraper = require('./lib/spotify');
const SearchEngine = require('./lib/search');
const Matcher = require('./lib/matcher');
const Downloader = require('./lib/downloader');
const Tagger = require('./lib/tagger');
const { addLog, getLogs } = require('./lib/utils');

// Initialize Components
const app = express();
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// State
let currentProcess = {
    active: false,
    shouldStop: false,
    currentOutputDir: OUTPUT_DIR, // Default
    progress: {
        status: 'Idle',
        current: 0,
        total: 0,
        currentTrack: '',
        eta: ''
    }
};

// --- Routes ---

app.get('/api/status', (req, res) => {
    res.json(currentProcess.progress);
});

app.get('/api/logs', (req, res) => {
    res.json({ logs: getLogs() });
});

app.get('/api/files', (req, res) => {
    const targetDir = currentProcess.currentOutputDir || OUTPUT_DIR;
    fs.readdir(targetDir, (err, files) => {
        if (err) return res.json({ files: [] }); // Return empty if dir doesn't exist yet/access denied
        res.json({ files: files.filter(f => f.endsWith('.mp3')) });
    });
});

app.post('/api/stop', (req, res) => {
    if (currentProcess.active) {
        currentProcess.shouldStop = true;
        currentProcess.progress.status = 'Stopping...';
        addLog('Stop signal received. Finishing current task...');
    }
    res.json({ message: 'Stop signal received' });
});

app.post('/api/process-playlist', async (req, res) => {
    if (currentProcess.active) {
        return res.status(400).json({ error: 'A process is already running' });
    }

    const { playlistUrl, downloadDir } = req.body;
    if (!playlistUrl) return res.status(400).json({ error: 'URL is required' });

    // Determind Output Dir
    const finalOutputDir = downloadDir ? path.resolve(downloadDir) : OUTPUT_DIR;

    if (!fs.existsSync(finalOutputDir)) {
        try {
            fs.mkdirSync(finalOutputDir, { recursive: true });
        } catch (e) {
            return res.status(500).json({ error: 'Invalid download path' });
        }
    }

    // Reset State
    currentProcess.active = true;
    currentProcess.shouldStop = false;
    currentProcess.currentOutputDir = finalOutputDir; // Update dynamic path
    currentProcess.progress = {
        status: 'Initializing...',
        current: 0,
        total: 0,
        currentTrack: '',
        eta: 'Calculating...'
    };

    res.json({ message: 'Started' });

    startProcessing(playlistUrl, finalOutputDir);
});

// --- Main Processing Loop ---

async function startProcessing(url, outputDir) {
    const scraper = new SpotifyScraper();
    const searcher = new SearchEngine();
    const matcher = new Matcher();
    const downloader = new Downloader(outputDir);
    const tagger = new Tagger();

    try {
        // 1. Scrape Spotify
        currentProcess.progress.status = 'Scraping Spotify metadata...';
        addLog('Starting scraping process...');

        const metadata = await scraper.fetchMetadata(url);
        await scraper.close(); // Close browser immediately after scraping

        if (!metadata || !metadata.tracks || metadata.tracks.length === 0) {
            throw new Error('No tracks found or scraping failed.');
        }

        addLog(`Found ${metadata.tracks.length} tracks in "${metadata.name}".`);
        currentProcess.progress.total = metadata.tracks.length;

        // 2. Process Queue
        const tracks = metadata.tracks;
        const downloadTimes = [];

        for (let i = 0; i < tracks.length; i++) {
            if (currentProcess.shouldStop) break;

            const track = tracks[i];
            currentProcess.progress.current = i + 1;
            currentProcess.progress.currentTrack = `${track.name} - ${track.artist}`;
            currentProcess.progress.currentCover = track.cover;
            currentProcess.progress.status = `Processing (${i + 1}/${tracks.length})`;

            // Check if exists
            const safeName = track.name.replace(/[<>:"/\\|?*]/g, '');
            const safeArtist = track.artist.replace(/[<>:"/\\|?*]/g, '');
            const expectedFile = path.join(outputDir, `${safeArtist} - ${safeName}.mp3`);

            if (fs.existsSync(expectedFile)) {
                addLog(`Skipping (Exists): ${track.name}`);
                continue;
            }

            const startTime = Date.now();

            try {
                // A. Search
                addLog(`Searching for: ${track.artist} - ${track.name}`);
                const candidates = await searcher.findCandidates(track);

                // B. Match
                const bestMatch = matcher.findBestMatch(track, candidates);

                if (!bestMatch) {
                    addLog(`No good match found for: ${track.name}`);
                    continue;
                }

                // C. Download
                addLog(`Downloading: ${bestMatch.title} (${bestMatch.duration}s)`);
                const downloadedPath = await downloader.download(track, bestMatch.url);

                // D. Tag
                addLog(`Tagging...`);
                await tagger.tag(downloadedPath, {
                    name: track.name,
                    artist: track.artist,
                    album: metadata.name,
                    cover: track.cover
                });

                const duration = Date.now() - startTime;
                downloadTimes.push(duration);

                // ETA Update
                const avgTime = downloadTimes.reduce((a, b) => a + b, 0) / downloadTimes.length;
                const remaining = tracks.length - (i + 1);
                const etaSec = Math.ceil((avgTime * remaining) / 1000);
                currentProcess.progress.eta = `${Math.floor(etaSec / 60)}m ${etaSec % 60}s remaining`;

            } catch (err) {
                addLog(`Error processing ${track.name}: ${err.message}`);
            }
        }

        addLog('All pending tasks finished.');
        currentProcess.progress.status = currentProcess.shouldStop ? 'Stopped' : 'Completed';

    } catch (err) {
        addLog(`CRITICAL ERROR: ${err.message}`);
        currentProcess.progress.status = `Error: ${err.message}`;
        await scraper.close();
    } finally {
        currentProcess.active = false;
        currentProcess.progress.currentTrack = '';
    }
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    addLog(`Server started on port ${PORT}`);
});
