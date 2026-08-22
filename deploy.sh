#!/bin/bash
set -e

# ─── TourNepal Production Deployment Script ───
DOMAIN="tour.aprayogshala.com.np"
APP_DIR="/opt/tournepal"

echo "=== TourNepal Deployment ==="
echo ""

# 1. System setup
echo "[1/8] Installing Nginx + Certbot..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx

# 2. Clone or pull repo
echo "[2/8] Setting up application..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git pull
else
    sudo rm -rf "$APP_DIR"
    sudo git clone https://github.com/YOUR_GITHUB_REPO.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 3. Copy production env
echo "[3/8] Configuring environment..."
if [ ! -f ".env.production" ]; then
    echo "ERROR: .env.production not found! Copy it to the repo root first."
    exit 1
fi
cp .env.production backend/.env

# 4. Build and start services
echo "[4/8] Building and starting Docker services..."
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 5. Wait for backend
echo "[5/8] Waiting for backend..."
sleep 15

# 6. Seed database
echo "[6/8] Seeding database..."
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend python manage.py seed_uat || true

# 7. Nginx reverse proxy (before certbot)
echo "[7/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/tournepal > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name tour.aprayogshala.com.np;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
echo ""
echo "  UAT Users:"
echo "    Customer:  customer@uat.tour0 / customer123!"
echo "    Admin:     admin@uat.tour0 / admin123!"
echo "    Super:     superadmin@uat.tour0 / admin123!"
echo ""
echo "  To update later:"
echo "    cd $APP_DIR && git pull"
echo "    sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
echo ""
