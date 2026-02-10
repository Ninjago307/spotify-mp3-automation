const downloadBtn = document.getElementById('downloadBtn');
const stopBtn = document.getElementById('stopBtn');
const urlInput = document.getElementById('playlistUrl');
const downloadPathInput = document.getElementById('downloadPath');
const progressSection = document.getElementById('progressSection');
const logsContainer = document.getElementById('logs');

// UI Elements
const currentCover = document.getElementById('currentCover');
const currentTitle = document.getElementById('currentTitle');
const currentStatus = document.getElementById('currentStatus');
const currentMeta = document.getElementById('currentMeta');

let isRunning = false;
let pollInterval;

// Add Track List container if it exists, otherwise ignore
const trackListEl = document.getElementById('trackList');
const trackCountEl = document.getElementById('trackCount');

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const downloadDir = downloadPathInput ? downloadPathInput.value.trim() : '';

    if (!url) return alert('Please enter a Spotify Playlist URL');

    isRunning = true;
    updateUIState(true);

    try {
        const res = await fetch('/api/process-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlistUrl: url,
                downloadDir: downloadDir
            })
        });
        const data = await res.json();

        if (res.ok) {
            startPolling();
        } else {
            alert(data.error);
            isRunning = false;
            updateUIState(false);
        }
    } catch (e) {
        console.error(e);
        alert('Connection failed: ' + e.message);
        isRunning = false;
        updateUIState(false);
    }
});

stopBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to stop?')) return;

    try {
        stopBtn.textContent = 'Stopping...';
        await fetch('/api/stop', { method: 'POST' });
        stopBtn.disabled = true;
    } catch (e) {
        alert('Failed to stop');
    }
});

function updateUIState(running) {
    if (running) {
        downloadBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        stopBtn.disabled = false;
        stopBtn.textContent = 'Stop Process';
        if (progressSection) progressSection.style.display = 'block';
        if (logsContainer) logsContainer.innerHTML = '';
    } else {
        downloadBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    }
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
        try {
            const res = await fetch('/api/status');
            const status = await res.json();

            // Update UI
            if (currentStatus) currentStatus.textContent = status.status;

            // Update Track Info
            if (status.currentTrack) {
                const parts = status.currentTrack.split(' - ');
                if (currentTitle) currentTitle.textContent = parts[0] || 'Unknown Title';

                if (currentCover && status.currentCover) {
                    currentCover.src = status.currentCover;
                    currentCover.style.opacity = 1;
                }

                if (currentMeta && status.eta) {
                    currentMeta.textContent = `Progress: ${status.current}/${status.total} • ETA: ${status.eta}`;
                }
            }

            // Update Logs
            const logRes = await fetch('/api/logs');
            const logData = await logRes.json();
            if (logsContainer) renderLogs(logData.logs);

            // Check if done
            if (status.status === 'Completed' || status.status === 'Stopped' || status.status.startsWith('Error')) {
                clearInterval(pollInterval);
                isRunning = false;
                updateUIState(false);
                if (currentStatus) currentStatus.textContent = status.status === 'Completed' ? 'All downloads finished!' : status.status;

                if (status.status === 'Completed') alert('Download Complete!');
            }

        } catch (e) {
            console.error('Poll error', e);
        }
    }, 1000);
}

let lastLogCount = 0;
function renderLogs(logs) {
    if (logs.length === lastLogCount) return;

    // Only append new logs
    const newLogs = logs.slice(lastLogCount);
    newLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        if (log.includes('Downloading')) div.classList.add('highlight');
        if (log.includes('Error')) div.classList.add('error');
        div.textContent = log;
        logsContainer.appendChild(div);
    });

    lastLogCount = logs.length;
    logsContainer.scrollTop = logsContainer.scrollHeight;
}
