#!/usr/bin/env bash
set -e

echo "🚀 Starting DRAA Deployment..."

# 1. Fetch latest changes from GitHub
echo "📦 Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies across all workspaces
echo "📥 Installing dependencies..."
npm install

# 3. Build all workspace packages and static bundles
echo "🔨 Building shared package, backend, and frontend bundles..."
npm run build

# 4. Restart/Reload backend service with PM2 (if running on VPS)
if command -v pm2 >/dev/null 2>&1; then
  echo "🔄 Reloading PM2 backend service..."
  if pm2 list | grep -q "draa-backend"; then
    pm2 reload ecosystem.config.cjs --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
else
  echo "ℹ️  PM2 not installed in current environment (skipped - active on Hostinger VPS)."
fi

# 5. Reload Nginx to serve new frontend assets (if running on VPS)
if command -v systemctl >/dev/null 2>&1; then
  echo "🌐 Reloading Nginx..."
  sudo systemctl reload nginx
else
  echo "ℹ️  Nginx/systemctl not present in current environment (skipped - active on Hostinger VPS)."
fi

echo "✅ DRAA Platform deployment and build completed successfully!"
