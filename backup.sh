#!/bin/bash
set -e

# ─── TourNepal Database Backup Script ───
# Run via cron: 0 2 * * * /opt/tournepal/backup.sh
BACKUP_DIR="/opt/tournepal/backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

sudo docker compose -f /opt/tournepal/docker-compose.yml -f /opt/tournepal/docker-compose.prod.yml \
    exec -T db pg_dump -U "${POSTGRES_USER:-tour}" "${POSTGRES_DB:-tour_db}" \
    | gzip > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

# Delete backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "[$(date)] Backup complete: db_${TIMESTAMP}.sql.gz"
