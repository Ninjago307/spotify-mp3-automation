# Spotify MP3 Automation

A high-fidelity music downloader that automates Spotify playlist extraction and YouTube-based MP3 conversion with full metadata tagging. Runs entirely locally, requiring no API keys or third-party accounts.

## How It Works

This tool orchestrates a multi-step process to transform Spotify links into tagged MP3 files:

*   **Playlist Extraction**: Uses headless browser automation (Puppeteer) to scrape track metadata (Title, Artist, Album, Cover Art) directly from Spotify's web interface.
*   **Source Resolution**: Queries YouTube via `yt-search` to find the most accurate audio match based on duration and title similarity.
*   **High-Quality Download**: Leverages `yt-dlp` to extract the best available audio stream (up to 320kbps).
*   **Format Conversion**: Utilizes FFmpeg to convert the raw stream into MP3 format.
*   **Metadata Tagging**: Automatically embeds ID3 tags, including Cover Art, Artist, Album, and Year, into the final file.

## Screenshots

![Application Interface](https://via.placeholder.com/800x400?text=Application+Interface)

*Clean, responsive UI with real-time download progress.*

![Terminal Output](https://via.placeholder.com/800x200?text=Terminal+Log+Output)

*Detailed logging for debugging and transparency.*

## Installation

### Prerequisites

You must have the following installed on your system:

1.  **Node.js (LTS)**: Required for the runtime environment.
2.  **Git**: Required for version control.
3.  **FFmpeg**: Required for audio processing.
    *   **Windows**: Download `ffmpeg.exe` and place it in the project root.
    *   **Mac/Linux**: Install via package manager (e.g., `brew install ffmpeg`).

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Ninjago307/spotify-mp3-automation.git
cd spotify-mp3-automation
npm install
```

### Running the Application

Start the local server:

**Windows**:
Double-click `start.bat` or run:
```bash
npm start
```

**Mac/Linux**:
Run the shell script or npm command:
```bash
sh start.sh
# OR
npm start
```

Access the interface at `http://localhost:3000`.

## Developer Experience

### Environment Variables

Configuration is optional but supported via a `.env` file. See `.env.example` for details.

*   `PORT`: Override the default server port (Default: 3000).
*   `EDGE_PATH`: Manually specify the path to the Edge/Chrome executable if auto-detection fails.

### Project Structure

*   `lib/`: Core logic modules.
    *   `downloader.js`: Handles audio extraction via `yt-dlp`.
    *   `spotify.js`: Manages Puppeteer browser automation.
    *   `tagger.js`: Embeds metadata into MP3 files.
    *   `utils.js`: Helper functions for logging and path detection.
*   `public/`: Frontend assets (HTML/CSS/JS).
*   `server.js`: Express server entry point.
*   `output/`: default directory for downloaded files.

### Logging

The application uses a custom logging system found in `lib/utils.js`. Logs are displayed in the console and streamed to the frontend.

*   **INFO**: General process updates (e.g., "Starting download...").
*   **WARN**: Non-critical issues (e.g., "Cover art not found").
*   **ERROR**: Critical failures preventing a download (e.g., "Network timeout").

## Reliability & Limitations

*   **Matching Accuracy**: The tool uses fuzzy matching algorithms. Occasionally, live versions, remixes, or covers may be selected if the official audio is not the top result on YouTube.
*   **Region Locking**: Downloads depend on YouTube availability. Content restricted in your region will fail to download.
*   **Private Playlists**: The tool can only access Public or Unlisted Spotify playlists. Private playlists are not supported.

## Roadmap

*   [ ] **Queue Management**: Implement a persistent download queue for handling multiple playlists.
*   [ ] **Headless Toggle**: Add a UI switch to run the browser in fully headless mode.
*   [ ] **Metadata Editor**: Allow users to manually correct tags before final save.
*   [ ] **Docker Support**: Containerize the application for easier deployment.
*   [ ] **Bitrate Selection**: Add options for 128kbps, 192kbps, and 320kbps.

## Legal Disclaimer

This software is provided for educational and personal use only. The developers assume no liability for misuse. Users are responsible for complying with the Terms of Service of both Spotify and YouTube. Please respect copyright laws and support artists by streaming on official platforms.
