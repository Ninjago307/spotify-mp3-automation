# Spotify Downloader Pro 🎵

A professional-grade, automated tool to download Spotify playlists and tracks as high-quality MP3s with full metadata and cover art. 

![Project Banner](https://via.placeholder.com/1000x500/1db954/ffffff?text=Spotify+Downloader+Pro)

## ✨ Features

*   **🚫 No API Key Required**: Advanced scraping technology fetches playlist and track metadata without needing a Spotify Developer account or API keys.
*   **🎧 High Quality Audio**: Downloads the best available audio quality (up to 320kbps) using `yt-dlp`.
*   **🏷️ Automatic Tagging**: files are automatically tagged with:
    *   Cover Art 🖼️
    *   Artist Name 🎤
    *   Album Name 💿
    *   Track Title 🎵
    *   Release Year 📅
*   **🧠 Smart Matching Algorithm**: Uses Levenshtein distance and duration comparison to ensure the downloaded audio matches the exact Spotify track (avoiding remixes/covers).
*   **🎨 Modern UI**: A beautiful, responsive Glassmorphism interface with:
    *   Real-time progress updates.
    *   Dynamic background animations.
    *   Live log console.
*   **📂 Custom Output**: Choose exactly where you want your music saved.
*   **🚀 Batch Processing**: Download entire playlists or albums in one go.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript.
*   **Backend**: Node.js, Express.
*   **Core Libraries**: 
    *   `puppeteer-core` (Headless Scraping)
    *   `yt-dlp` (Audio Extraction)
    *   `fluent-ffmpeg` (Media Conversion & Tagging)
    *   `yt-search` (Source Finding)

## 🚀 How to Run

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Ninjago307/spotify-mp3-automation.git
    cd spotify-mp3-automation
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Application**
    *   **Double-click** `start.bat` (Windows)
    *   OR run: `npm start`

4.  **Open in Browser**
    Go to `http://localhost:3000`

## 📝 Usage

1.  Paste a **Spotify Link** (Track, Album, or Playlist).
2.  (Optional) Enter a **Custom Output Folder** path.
3.  Click **Start Download**.
4.  Watch the magic happen! ✨

## ⚠️ Disclaimer

This tool is for **educational purposes only**. Please respect copyright laws and the terms of service of the respective platforms. Download music only if you have the right to do so.

---
*Built with ❤️ by [Ninjago307](https://github.com/Ninjago307)*
