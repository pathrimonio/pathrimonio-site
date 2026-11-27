@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encontro npm en el PATH. Instala Node.js LTS primero.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando Pathrimonio en http://localhost:3000 ...
call npm run dev -- --open
if errorlevel 1 (
  echo.
  echo [ERROR] El servidor local se detuvo con codigo %errorlevel%.
  pause
  exit /b %errorlevel%
)