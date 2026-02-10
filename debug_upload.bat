@echo off
echo Running Diagnosis... > upload_log.txt
echo --------------------------------------------------- >> upload_log.txt
echo CHECKING GIT VERSION: >> upload_log.txt
git --version >> upload_log.txt 2>&1
echo. >> upload_log.txt

echo INITIALIZING REPO: >> upload_log.txt
git init >> upload_log.txt 2>&1
git add . >> upload_log.txt 2>&1
git commit -m "Force Update" >> upload_log.txt 2>&1
echo. >> upload_log.txt

echo CONFIGURING REMOTE: >> upload_log.txt
git remote remove origin >> upload_log.txt 2>&1
git remote add origin https://github.com/Ninjago307/spotify-mp3-automation.git >> upload_log.txt 2>&1
git branch -M main >> upload_log.txt 2>&1
echo. >> upload_log.txt

echo PUSHING TO GITHUB: >> upload_log.txt
git push -u origin main >> upload_log.txt 2>&1
echo. >> upload_log.txt
echo --------------------------------------------------- >> upload_log.txt

echo.
echo Diagnosis Complete!
echo A file named 'upload_log.txt' has been created.
echo Please tell the agent "I ran the debug script".
pause
