@echo off
rem Opens ARCHIVE_Studio.html in Chrome (or Edge) using the OpenGL graphics path.
rem Chrome's default Direct3D path on Windows cannot build the film's large shader; OpenGL can.
rem A separate browser profile is used so this works even while your normal Chrome is open.

set "HTML=%~dp0ARCHIVE_Studio.html"
set "PROFILE=%TEMP%\archive-studio-profile"
set "FLAGS=--use-angle=gl --ignore-gpu-blocklist --user-data-dir="%PROFILE%" --no-first-run"

set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if not defined BROWSER (
  echo Could not find Chrome or Edge.
  pause
  exit /b 1
)

start "" "%BROWSER%" %FLAGS% "%HTML%"
