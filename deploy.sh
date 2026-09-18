#!/usr/bin/env bash
set -e

echo "🚀 Starting DRAA Deployment on Hostinger VPS..."

# 1. Fetch latest changes from GitHub
echo "📦 Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies across all workspaces
echo "📥 Installing dependencies..."
npm install

# 3. Build all workspace packages and static bundles
echo "🔨 Building shared package, backend, and frontend bundles..."
npm run build

# 4. Restart/Reload backend service with PM2
echo "🔄 Reloading PM2 backend service..."
if pm2 list | grep -q "draa-backend"; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

# 5. Reload Nginx to serve new frontend assets
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ DRAA Platform deployed and running successfully!"
