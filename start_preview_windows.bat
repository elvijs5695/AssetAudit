@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Vispirms jaizinstale Node.js 22 vai jaunaks. https://nodejs.org
  pause
  exit /b 1
)
node scripts\build_site.mjs
if errorlevel 1 (
  echo Aplikacijas izveide neizdevas.
  pause
  exit /b 1
)
cd dist
where py >nul 2>nul
if errorlevel 1 (
  echo Vispirms jaizinstale Python 3, lai darbinatu lokalserveri.
  echo Vai palaidiet lokalu HTTP serveri citiem lidzekliem.
  pause
  exit /b 1
)
echo Atveriet parluka http://localhost:8765
start "" http://localhost:8765
py -m http.server 8765
