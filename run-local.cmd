@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 exit /b 1
)

echo Iniciando Vite... se abre el navegador automaticamente.
call npm run dev -- --open
