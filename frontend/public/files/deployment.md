# SOP: Deployment — Hostinger VPS
> Layer 1 Architecture Document. Follow exactly for production deploy.

---

## Stack
- OS: Ubuntu 22.04 LTS
- Web server: Nginx
- App server: Gunicorn
- Database: PostgreSQL 15
- SSL: Let's Encrypt (Certbot)
- Process manager: systemd

---

## Directory Structure on VPS
```
/var/www/zeleradeck/
├── backend/          ← Django project
│   ├── .env          ← Production secrets
│   ├── venv/         ← Python virtualenv
│   └── manage.py
└── frontend/
    └── dist/         ← React production build (served by Nginx)
```

---

## Step-by-Step Deployment

### 1. VPS Initial Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx -y
```

### 2. PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE DATABASE zeleradeck_db;
CREATE USER zeleradeck_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zeleradeck_db TO zeleradeck_user;
\q
```

### 3. Django Setup
```bash
cd /var/www/zeleradeck/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in production values
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 4. Gunicorn systemd Service
Create `/etc/systemd/system/zeleradeck.service`:
```ini
[Unit]
Description=ZeleraDeck Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/zeleradeck/backend
ExecStart=/var/www/zeleradeck/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/zeleradeck.sock \
    config.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable zeleradeck
sudo systemctl start zeleradeck
```

### 5. Nginx Config
Create `/etc/nginx/sites-available/zeleradeck`:
```nginx
server {
    listen 80;
    server_name zeleradeck.com www.zeleradeck.com;

    # React frontend
    location / {
        root /var/www/zeleradeck/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Django API
    location /api/ {
        proxy_pass http://unix:/run/zeleradeck.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Django static files
    location /static/ {
        alias /var/www/zeleradeck/backend/staticfiles/;
    }

    client_max_body_size 10M;
}
```
```bash
sudo ln -s /etc/nginx/sites-available/zeleradeck /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate
```bash
sudo certbot --nginx -d zeleradeck.com -d www.zeleradeck.com
```
Auto-renewal is handled by Certbot's systemd timer. Verify: `sudo certbot renew --dry-run`

---

## Environment Variables (.env)
```env
DEBUG=False
SECRET_KEY=your_django_secret_key_here
ALLOWED_HOSTS=zeleradeck.com,www.zeleradeck.com

DATABASE_URL=postgresql://zeleradeck_user:password@localhost/zeleradeck_db

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ALLOWED_ORIGINS=https://zeleradeck.com
```

---

## Smoke Test Checklist (Run After Every Deploy)
- [ ] `https://zeleradeck.com` loads (React app, HTTPS green)
- [ ] `https://zeleradeck.com/api/store/test-shop/` returns JSON (even if 404)
- [ ] Admin login works
- [ ] Create a test shop via admin panel
- [ ] Add a product with image — check Cloudinary
- [ ] Open `/store/test-shop` on real Android phone
- [ ] Click WhatsApp button — verify message prefills correctly
- [ ] QR code downloads as PNG
- [ ] Disable shop → verify public page shows disabled state

---

## Rollback Procedure
```bash
cd /var/www/zeleradeck/backend
git log --oneline -5        # find last good commit
git checkout {commit_hash}
sudo systemctl restart zeleradeck
```
