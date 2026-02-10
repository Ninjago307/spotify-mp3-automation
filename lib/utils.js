const fs = require('fs');
const path = require('path');

// --- Logging System ---
const logs = [];

function addLog(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${msg}`;
    logs.push(logEntry);
    if (logs.length > 500) logs.shift();
    console.log(logEntry);
}

function getLogs() {
    return logs;
}

// --- Browser Path Finder ---
function findBrowserPath() {
    const platform = process.platform;

    // Windows Paths (Priority)
    if (platform === 'win32') {
        const edgePaths = [
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            process.env.EDGE_PATH // Allow override via env
        ];
        for (const p of edgePaths) {
            if (p && fs.existsSync(p)) return p;
        }
    }

    // Mac/Linux Paths
    if (platform === 'darwin') {
        const macPaths = [
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        ];
        for (const p of macPaths) {
            if (fs.existsSync(p)) return p;
        }
    }

    if (platform === 'linux') {
        const linuxPaths = [
            '/usr/bin/microsoft-edge',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser'
        ];
        for (const p of linuxPaths) {
            if (fs.existsSync(p)) return p;
        }
    }

    return null;
}

// --- Filename Sanitizer ---
function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]/g, '').trim();
}

module.exports = {
    addLog,
    getLogs,
    findBrowserPath,
    sanitizeFilename
};
