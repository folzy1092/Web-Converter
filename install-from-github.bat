@echo off
setlocal enabledelayedexpansion
title Web Converter - install

set "REPO_ZIP=https://github.com/folzy1092/Web-Converter/archive/refs/heads/master.zip"
set "DEST=%LOCALAPPDATA%\WebConverter"
set "TMPZIP=%TEMP%\web-converter-src.zip"

echo Downloading Web Converter from GitHub...
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%REPO_ZIP%' -OutFile '%TMPZIP%'"
if errorlevel 1 (
  echo.
  echo Download failed - check your internet connection.
  pause
  exit /b 1
)

echo Unpacking...
if exist "%DEST%" rmdir /s /q "%DEST%"
powershell -NoProfile -Command "Expand-Archive -Path '%TMPZIP%' -DestinationPath '%DEST%' -Force"
del "%TMPZIP%" >nul 2>&1

for /f "delims=" %%D in ('powershell -NoProfile -Command "(Get-ChildItem -Path '%DEST%' -Recurse -Filter manifest.json | Select-Object -First 1).DirectoryName"') do set "EXTDIR=%%D"

if not defined EXTDIR (
  echo.
  echo Couldn't find the extension files after unpacking. Nothing to load.
  pause
  exit /b 1
)

rem Figure out which browser to use: prefer one that's already running,
rem since --load-extension only takes effect on a fresh browser process.
set "BROWSERNAME="
set "BROWSER="

for %%P in (brave chrome msedge) do (
  if not defined BROWSERNAME (
    for /f "delims=" %%B in ('powershell -NoProfile -Command "(Get-Process -Name '%%P' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)"') do (
      set "BROWSERNAME=%%P"
      set "BROWSER=%%B"
    )
  )
)

if not defined BROWSER if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
  set "BROWSERNAME=brave"
  set "BROWSER=%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"
)
if not defined BROWSER if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" (
  set "BROWSERNAME=brave"
  set "BROWSER=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
)
if not defined BROWSER if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" (
  set "BROWSERNAME=brave"
  set "BROWSER=%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
)
if not defined BROWSER if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  set "BROWSERNAME=chrome"
  set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  set "BROWSERNAME=chrome"
  set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
  set "BROWSERNAME=chrome"
  set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSERNAME=msedge"
  set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
)

if not defined BROWSER (
  echo.
  echo Couldn't find or detect Brave, Chrome or Edge.
  echo Open your browser yourself, go to the extensions page, turn on Developer
  echo mode, click "Load unpacked" and pick this folder:
  echo   %EXTDIR%
  pause
  exit /b 1
)

echo.
echo Found: %BROWSERNAME%
echo This needs to restart it to load the extension - save anything
echo important in open tabs now.
pause

taskkill /IM %BROWSERNAME%.exe /F >nul 2>&1
timeout /t 1 >nul

echo Opening Web Converter...
start "" "%BROWSER%" --load-extension="%EXTDIR%"

echo.
echo ============================================================
echo  You'll see a bar at the top: "Disable developer mode
echo  extensions" - that's normal. Click the small arrow on it
echo  and choose "Keep" (NOT the button that disables it).
echo  After that the icon stays in the toolbar for good.
echo ============================================================
echo.
pause
