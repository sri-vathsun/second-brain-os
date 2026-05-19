$ErrorActionPreference = "Stop"

Write-Host "Starting Second Brain OS..." -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js (npm) is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

$RootDir = Get-Location

# 1. Start Backend
Write-Host "`nStarting Backend..." -ForegroundColor Yellow
Set-Location "$RootDir\backend"

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Activating venv and installing requirements..."
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt | Out-Null

Write-Host "Starting FastAPI server on port 8000..."
Start-Process -NoNewWindow -FilePath "uvicorn" -ArgumentList "main:app --reload --port 8000"

# 2. Start Frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
Set-Location "$RootDir\frontend"

Write-Host "Installing npm dependencies..."
npm install | Out-Null

Write-Host "Starting Next.js server on port 3000..."
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"

Write-Host "`nAll services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop all services (you may need to manually close the background processes if they don't terminate)."

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    # Best-effort cleanup for Windows
    Stop-Process -Name "uvicorn" -ErrorAction SilentlyContinue
    Stop-Process -Name "node" -ErrorAction SilentlyContinue
}
