@echo off
echo ==========================================
echo      STARTING SPOTIFY DOWNLOADER
echo ==========================================
echo.
echo 1. Opening the website for you...
start "" "http://localhost:3000"

echo 2. Starting the engine...
call node server.js

echo.
echo ==========================================
echo    OOPS! The server stopped.
echo    Read the error above if there is one.
echo ==========================================
pause
