@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 24 ou superior para usar contas, clas e raids.
  echo Para campanha e treino offline, abra VEILFALL.html.
  pause
  exit /b 1
)
node tools\launch.cjs
pause
