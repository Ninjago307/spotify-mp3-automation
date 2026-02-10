# Spotify Downloader Pro 🎵

A professional-grade, automated tool to download Spotify playlists and tracks as high-quality MP3s with full metadata and cover art.

![Project Banner](https://via.placeholder.com/1000x500/1db954/ffffff?text=Spotify+Downloader+Pro)

## ✨ Features

*   **🚫 No API Key Required**: Fetches metadata without complex Spotify Developer accounts.
*   **🎧 High Quality Audio**: Downloads up to 320kbps using `yt-dlp`.
*   **🏷️ Automatic Tagging**: Adds Cover Art, Artist, Album, Title, and Year metadata.
*   **🧠 Smart Matching**: Verifies duration and title match to avoid wrong versions.
*   **🎨 Modern UI**: Beautiful, responsive Glassmorphism interface.
*   **🚀 Batch Processing**: Download entire playlists or albums at once.

---

## 📥 Installation Guide (Step-by-Step)

If you are setting this up on a **new laptop**, follow these steps exactly.

### 1. Install Prerequisites

Before you begin, you need to install a few tools:

*   **Node.js**: Download and install the "LTS" version from [nodejs.org](https://nodejs.org/).
*   **Git**: Download and install from [git-scm.com](https://git-scm.com/downloads).
    *   *During installation, you can just click "Next" through all the options.*

### 2. Download the Project

Open a terminal (Command Prompt or PowerShell) and run:

```bash
git clone https://github.com/Ninjago307/spotify-mp3-automation.git
cd spotify-mp3-automation
```

*Alternatively, you can click the green "Code" button on GitHub and select "Download ZIP", then extract it.*

### 3. Install Dependencies

In the project folder, run this command to install the required libraries:

```bash
npm install
```

> **Note:** If you see "audit" warnings, you can usually ignore them.

### 4. Set Up FFmpeg (Crucial for MP3 Conversion)

This tool depends on **FFmpeg** to convert audio to MP3.

1.  Download **ffmpeg-master-latest-win64-gpl.zip** from [this link](https://github.com/BtbN/FFmpeg-Builds/releases).
2.  Open the zip file.
3.  Go into the `bin` folder inside the zip.
4.  Copy `ffmpeg.exe`.
5.  **Paste `ffmpeg.exe` directly into this project's folder** (where `package.json` and `start.bat` are).

### 5. Run the Application

Now you are ready to start!

*   **Double-click** `start.bat`
*   *OR* run `npm start` in the terminal.

The application should automatically open in your browser at `http://localhost:3000`.

---

## 📝 Usage

1.  **Paste a Spotify Link**: Works with Tracks, Albums, or Playlists.
2.  **Choose Output Folder** (Optional): Defaults to an `output` folder inside the project.
3.  **Click "Start Download"**.
4.  Watch the progress! Music will be saved with full tags.

---

## ❓ Troubleshooting

### "Cannot find module '...'"
If you see an error saying a module is missing (e.g., `dotenv`), it means dependencies weren't installed.
*   **Fix**: Run `npm install` again in the project folder.

### "ffmpeg is not recognized" or Download Fails
If downloads start but fail immediately or audio isn't converting:
*   **Fix**: Ensure `ffmpeg.exe` is in the project folder.

### "git is not recognized"
*   **Fix**: Ensure you installed Git and restarted your terminal/computer.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3, Vanilla JS
*   **Backend**: Node.js, Express
*   **Core**: `puppeteer-core`, `yt-dlp`, `fluent-ffmpeg`, `yt-search`

---

*Built for educational purposes.*
