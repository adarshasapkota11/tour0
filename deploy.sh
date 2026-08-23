#!/bin/bash
set -e

# ─── TourNepal Production Deployment Script ───
DOMAIN="tour.aprayogshala.com.np"
APP_DIR="/opt/tournepal"

echo "=== TourNepal Deployment ==="
echo ""

# 1. Pre-flight: check disk space
echo "[1/8] Pre-flight checks..."
DISK_PCT=$(df / --output=pcent | tail -1 | tr -d '% ')
if [ "$DISK_PCT" -gt 90 ]; then
    echo "ERROR: Disk usage is ${DISK_PCT}% — too high to deploy safely."
    echo "       Run: sudo journalctl --vacuum-size=10M && sudo docker image prune -af"
    exit 1
fi

# 2. System setup
echo "[2/8] Installing Nginx + Certbot..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx ufw

# 3. Clone or pull repo
echo "[3/8] Setting up application..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git pull
else
    sudo rm -rf "$APP_DIR"
    sudo git clone https://github.com/adarshasapkota11/tour0 "$APP_DIR"
    cd "$APP_DIR"
fi

# 4. Copy production env
echo "[4/8] Configuring environment..."
if [ ! -f ".env.production" ]; then
    echo "ERROR: .env.production not found! Copy it to the repo root first."
    exit 1
fi
cp .env.production backend/.env

# 5. Build and start services
echo "[5/8] Building and starting Docker services..."
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 6. Wait for backend
echo "[6/8] Waiting for backend..."
sleep 15

# 7. Nginx reverse proxy (before certbot)
echo "[7/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/tournepal > /dev/null << 'NGINXEOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name tour.aprayogshala.com.np;

    client_max_body_size 20M;

    proxy_buffer_size 16k;
    proxy_buffers 8 32k;
    proxy_busy_buffers_size 64k;
    proxy_http_version 1.1;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_vary on;
    gzip_min_length 256;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/tournepal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL with Let's Encrypt
echo "[8/8] Setting up SSL (Let's Encrypt)..."
sudo certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "admin@aprayogshala.com.np" \
    --redirect || {
        echo "WARN: Certbot failed. Make sure DNS A record for $DOMAIN points to this server."
        echo "      Then run: sudo certbot --nginx -d $DOMAIN"
    }

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "  URL:    https://$DOMAIN"
echo "  Admin:  https://$DOMAIN/admin"
echo "  API:    https://$DOMAIN/api/"
echo "  Health: https://$DOMAIN/health/"
echo ""
echo "  To update later:"
echo "    cd $APP_DIR && git pull"
echo "    sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
echo ""
