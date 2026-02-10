@echo off
setlocal

echo Searching for Git...

rem Try standard locations
if exist "C:\Program Files\Git\cmd\git.exe" set "GIT_PATH=C:\Program Files\Git\cmd\git.exe" & goto :FOUND
if exist "C:\Program Files\Git\bin\git.exe" set "GIT_PATH=C:\Program Files\Git\bin\git.exe" & goto :FOUND
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "GIT_PATH=C:\Program Files (x86)\Git\cmd\git.exe" & goto :FOUND
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe" set "GIT_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe" & goto :FOUND
if exist "C:\Users\%USERNAME%\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe" set "GIT_PATH=C:\Users\%USERNAME%\AppData\Local\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe" & goto :FOUND

rem Try PATH
where git >nul 2>nul
if %errorlevel% equ 0 set "GIT_PATH=git" & goto :FOUND

echo.
echo ================================================================
echo COULD NOT FIND GIT AUTOMATICALLY!
echo ================================================================
echo If you installed Git, your computer might need a restart.
echo.
echo BUT you can paste the full path to 'git.exe' here to run it now.
echo Example: C:\Program Files\Git\cmd\git.exe
echo.
set /p GIT_PATH="Enter the path to git.exe (or close this window): "

:FOUND
echo.
echo Using Git at: "%GIT_PATH%"

"%GIT_PATH%" init
"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "Initial commit"
"%GIT_PATH%" remote add origin https://github.com/Ninjago307/spotify-mp3-automation.git
"%GIT_PATH%" branch -M main
"%GIT_PATH%" push -u origin main

echo.
echo Done!
pause
