# Levanta PATHrimonio en local con Vite (dev server con HMR).
# Uso: .\run-local.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Test-Path 'node_modules')) {
    Write-Host 'Instalando dependencias...' -ForegroundColor Cyan
    npm install
}

Write-Host 'Iniciando Vite... se abre el navegador automaticamente.' -ForegroundColor Green
npm run dev -- --open
