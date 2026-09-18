# 🚀 Complete Hostinger VPS Deployment Guide for DRAA Platform

This guide provides the exact commands, configurations, and architecture to deploy the entire **DRAA Monorepo** (Corporate Website, Study in India Portal, and Unified Backend API) on a **Hostinger VPS** running **Ubuntu 22.04 or 24.04 LTS**.

---

## 🏗️ Architecture Overview on VPS

```
                              Internet (HTTPS)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       https://draa.in (Corporate)       https://study.draa.in (Portal)
                     │                               │
        ┌────────────▼───────────────────────────────▼────────────┐
        │                     Nginx (Port 80/443)                 │
        │       Serves Static Vite Production Builds Directly     │
        └────────────────────────────┬────────────────────────────┘
                                     │ Proxy: /api/*
                                     ▼
                      PM2: DRAA Unified API (:4000)
                                     │
                                     ▼
                           MongoDB Service (:27017)
```

---

## 📋 Pre-Requisites & Domain Setup

Before running server commands, point your DNS records in your domain registrar (Hostinger DNS or Cloudflare) to your **Hostinger VPS IP Address**:

| Type | Host / Name | Value (Target) | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `YOUR_VPS_IP` | 300 | `https://draa.in` (Corporate) |
| **A** | `www` | `YOUR_VPS_IP` | 300 | `https://www.draa.in` |
| **A** | `study` | `YOUR_VPS_IP` | 300 | `https://study.draa.in` (Study in India Portal) |

*(Optional: If you use Cloudflare, keep DNS Proxy set to DNS-Only during initial SSL generation, then you can turn on the Orange Cloud proxy).*

---

## ⚡ Step 1: Connect to VPS & Update System

Open your terminal (PowerShell, Command Prompt, or Terminal) and SSH into your Hostinger VPS:

```bash
ssh root@YOUR_VPS_IP
```

Update package lists and installed software:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw software-properties-common htop build-essential
```

---

## ⚡ Step 2: Configure Swap Memory (Critical Factor!)

Vite and TypeScript compilation during `npm run build` can consume up to 1.5GB of RAM. If your VPS has 2GB or 4GB of RAM, creating a Swap file prevents the Linux kernel from killing the build process (Out-Of-Memory error).

Run these commands:

```bash
# Create a 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across server reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

---

## ⚡ Step 3: Configure Firewall (Security)

Allow only SSH, HTTP, and HTTPS traffic. **Never** expose MongoDB (port 27017) or internal API ports (port 4000) to the public internet:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

## ⚡ Step 4: Install Node.js 20 LTS & PM2

Install Node.js 20.x (Active LTS) via the official NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node and NPM versions
node -v
npm -v

# Install PM2 globally for background process management
sudo npm install -g pm2
```

---

## ⚡ Step 5: Install & Start MongoDB

Install MongoDB Community Edition natively as a background systemd service:

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes

# Add MongoDB APT repository (Ubuntu 22.04 Jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB packages
sudo apt update
sudo apt install -y mongodb-org

# Enable and start MongoDB service
sudo systemctl enable mongod
sudo systemctl start mongod

# Verify MongoDB is active
sudo systemctl status mongod --no-pager
```

---

## ⚡ Step 6: Clone the Repository & Configure Environment

Clone your GitHub repository into `/var/www/draa`:

```bash
sudo mkdir -p /var/www/draa
sudo chown -R $USER:$USER /var/www/draa
cd /var/www/draa

git clone https://github.com/zibreelansari/draa-main.git .
```

### Create the Production Environment File (`.env`)

Create the `.env` file in the project root:

```bash
nano .env
```

Paste the following production configuration (replace with your actual domain and strong secrets):

```env
# ── DRAA Platform Production Configuration ────────────────────────────────────

# Node environment
NODE_ENV=production

# Unified API Server Port (Bound internally)
PORT=4000

# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/draa

# Allowed CORS Origins (comma-separated, your live domains)
WEB_ORIGIN=https://draa.in,https://www.draa.in,https://study.draa.in

# Auth & Session Security
SESSION_DAYS=14
# Generate a strong 64-character secret! Run: openssl rand -base64 32
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_SECURE_RANDOM_SECRET_KEY_HERE

# Seed database on first boot (set to true initially, then false after first run)
SEED_DEMO=true
```

Save and exit in nano: press `CTRL + O`, `ENTER`, then `CTRL + X`.

---

## ⚡ Step 7: Install Dependencies & Build All Workspaces

Run the monorepo installation and production build:

```bash
cd /var/www/draa

# 1. Install all monorepo dependencies
npm install

# 2. Build shared library, backend, and both frontends
npm run build

# 3. Seed initial institutes, courses, and accounts into MongoDB
npm run db:seed

# Optional: verify all live tests pass on the VPS
npm test
```

*(After seeding once, change `SEED_DEMO=false` in `.env` so database records are not reset on future restarts).*

---

## ⚡ Step 8: Start Backend API with PM2

Start the backend service using the included `ecosystem.config.cjs`:

```bash
cd /var/www/draa
pm2 start ecosystem.config.cjs

# Enable PM2 to auto-start on server boot
pm2 startup systemd -u $USER --hp /root
# (Run the command that PM2 prints on your screen if prompted)

# Save the running processes
pm2 save

# Verify status & logs
pm2 status
pm2 logs draa-backend --lines 20
```

---

## ⚡ Step 9: Install & Configure Nginx

Install Nginx:

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Create Nginx Configuration for DRAA

Remove default Nginx page:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Create a new Nginx virtual host configuration:

```bash
sudo nano /etc/nginx/sites-available/draa.conf
```

Paste the following complete configuration (replace `draa.in` and `study.draa.in` with your domains):

```nginx
# ── 1. CORPORATE WEBSITE (draa.in & www.draa.in) ─────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name draa.in www.draa.in;

    root /var/www/draa/frontend/corporate/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # SPA Routing (Redirects all page routes to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (CSS, JS, images, fonts)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}

# ── 2. STUDY IN INDIA PORTAL (study.draa.in) ─────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name study.draa.in;

    root /var/www/draa/frontend/study-india/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Proxy all API requests to the PM2 Backend (:4000)
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}
```

Save and exit (`CTRL + O`, `ENTER`, `CTRL + X`).

Enable the site configuration and test Nginx syntax:

```bash
sudo ln -s /etc/nginx/sites-available/draa.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ⚡ Step 10: Setup Free HTTPS / SSL with Certbot

Install Certbot for automated Let's Encrypt SSL certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx

# Obtain and configure SSL certificates automatically
sudo certbot --nginx -d draa.in -d www.draa.in -d study.draa.in
```

Enter your email address, agree to the Terms of Service, and choose to redirect HTTP traffic to HTTPS. Certbot will configure SSL automatically with auto-renewal enabled!

Test certificate auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## ⚡ Step 11: One-Click Update Script (`./deploy.sh`)

Whenever you make changes or push new commits to GitHub, you can update your live website on your Hostinger VPS in seconds:

Make the included `deploy.sh` script executable:

```bash
cd /var/www/draa
chmod +x deploy.sh
```

To update your live website anytime in the future, simply run:

```bash
./deploy.sh
```

---

## 🛡️ Critical Production Factors & Checklist

| Factor | Detail & Recommendation |
| :--- | :--- |
| **`SEED_DEMO`** | After your initial deployment and verifying demo accounts, set `SEED_DEMO=false` in `.env` to prevent test seeders from overwriting live user submissions on service restarts. |
| **`JWT_SECRET`** | Never use default secrets. Generate a random 64-char key using `openssl rand -base64 32` and paste it into `.env`. |
| **Database Backups** | Setup a daily cron job to backup MongoDB data: `0 2 * * * mongodump --out /var/backups/mongo/$(date +\%F)`. |
| **Log Management** | PM2 automatically stores logs. Install `pm2-logrotate` to prevent logs from filling disk space: `pm2 install pm2-logrotate`. |
| **Mongo Express** | Do NOT leave `mongo-express` running publicly on port 8081 without authentication. In production, connect using MongoDB Compass via an SSH tunnel (`ssh -L 27017:127.0.0.1:27017 root@YOUR_VPS_IP`). |
| **CORS `WEB_ORIGIN`** | Ensure `.env` includes `https://draa.in,https://www.draa.in,https://study.draa.in`. |

---

## 📞 Handy Maintenance Commands

```bash
# Check Backend status & CPU/RAM usage
pm2 status
pm2 monit

# View live backend application logs
pm2 logs draa-backend

# Restart backend
pm2 restart draa-backend

# Check Nginx status & test configs
sudo nginx -t
sudo systemctl status nginx

# View live Nginx access / error logs
sudo tail -f /var/log/nginx/error.log
```
