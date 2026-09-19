# PowerShell Deployment & Build Script for DRAA Platform
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting DRAA Deployment & Build Process..." -ForegroundColor Cyan

# 1. Pull latest code from GitHub
Write-Host "📦 Pulling latest code from GitHub..." -ForegroundColor Yellow
git pull origin main

# 2. Install dependencies
Write-Host "📥 Installing dependencies across all workspaces..." -ForegroundColor Yellow
npm install

# 3. Build all workspace packages
Write-Host "🔨 Building shared package, backend, and frontend bundles..." -ForegroundColor Yellow
npm run build

# 4. PM2 reload (if installed)
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "🔄 Reloading PM2 services..." -ForegroundColor Yellow
    pm2 reload ecosystem.config.cjs --update-env
    pm2 save
} else {
    Write-Host "ℹ️  PM2 not found locally (active on Hostinger VPS)." -ForegroundColor DarkGray
}

Write-Host "✅ DRAA Platform deployment and build completed successfully!" -ForegroundColor Green
