@echo off
echo Initializing Git Repository...
git init
git add .
git commit -m "Initial commit"

echo Linking to Remote Repository...
git remote add origin https://github.com/Ninjago307/spotify-mp3-automation.git
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
echo Process Complete!
pause
