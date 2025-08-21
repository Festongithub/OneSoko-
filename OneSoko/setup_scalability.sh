#!/bin/bash

# OneSoko Backend Scalability Setup Script
# Run this script to install all dependencies and configure scalability features

echo "🚀 Setting up OneSoko Backend for Scalability..."

# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Redis
echo "📦 Installing Redis..."
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Redis for production
sudo tee /etc/redis/redis.conf > /dev/null <<EOF
# Redis configuration for OneSoko
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF

sudo systemctl restart redis-server

# Install MySQL optimizations
echo "🗄️ Configuring MySQL for performance..."
sudo tee /etc/mysql/conf.d/onesoko.cnf > /dev/null <<EOF
[mysqld]
# Performance optimizations
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_type = 1
query_cache_size = 128M
max_connections = 500
thread_cache_size = 16
table_open_cache = 2048
tmp_table_size = 64M
max_heap_table_size = 64M
EOF

sudo systemctl restart mysql

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements_production.txt

# Install additional scalability packages
pip install \
    celery[redis]==5.3.4 \
    django-redis==5.4.0 \
    django-db-pool==1.0.0 \
    django-ratelimit==4.1.0 \
    django-health-check==3.17.0 \
    django-storages==1.14.2 \
    boto3==1.34.0 \
    pillow==10.1.0 \
    gunicorn==21.2.0 \
    whitenoise==6.6.0 \
    sentry-sdk==1.38.0

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs media staticfiles
chmod 755 logs media staticfiles

# Set up Celery systemd services
echo "⚙️ Setting up Celery services..."

# Celery worker service
sudo tee /etc/systemd/system/celery.service > /dev/null <<EOF
[Unit]
Description=Celery Service
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
EnvironmentFile=/etc/celery/celery
WorkingDirectory=/path/to/OneSoko
ExecStart=/bin/sh -c '\${CELERY_BIN} multi start \${CELERYD_NODES} \\
  -A \${CELERY_APP} --pidfile=\${CELERYD_PID_FILE} \\
  --logfile=\${CELERYD_LOG_FILE} --loglevel=\${CELERYD_LOG_LEVEL} \${CELERYD_OPTS}'
ExecStop=/bin/sh -c '\${CELERY_BIN} multi stopwait \${CELERYD_NODES} \\
  --pidfile=\${CELERYD_PID_FILE}'
ExecReload=/bin/sh -c '\${CELERY_BIN} multi restart \${CELERYD_NODES} \\
  -A \${CELERY_APP} --pidfile=\${CELERYD_PID_FILE} \\
  --logfile=\${CELERYD_LOG_FILE} --loglevel=\${CELERYD_LOG_LEVEL} \${CELERYD_OPTS}'

[Install]
WantedBy=multi-user.target
EOF

# Celery beat service
sudo tee /etc/systemd/system/celerybeat.service > /dev/null <<EOF
[Unit]
Description=Celery Beat Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
EnvironmentFile=/etc/celery/celery
WorkingDirectory=/path/to/OneSoko
ExecStart=/bin/sh -c '\${CELERY_BIN} -A \${CELERY_APP} beat \\
  --pidfile=\${CELERYBEAT_PID_FILE} \\
  --logfile=\${CELERYBEAT_LOG_FILE} --loglevel=\${CELERYD_LOG_LEVEL}'

[Install]
WantedBy=multi-user.target
EOF

# Celery configuration
sudo mkdir -p /etc/celery
sudo tee /etc/celery/celery > /dev/null <<EOF
# Celery configuration
CELERY_APP="MyOneSoko"
CELERYD_NODES="worker1 worker2"
CELERYD_OPTS="--time-limit=300 --concurrency=4"
CELERYD_PID_FILE="/var/run/celery/%n.pid"
CELERYD_LOG_FILE="/var/log/celery/%n%I.log"
CELERYD_LOG_LEVEL="INFO"
CELERYBEAT_PID_FILE="/var/run/celery/beat.pid"
CELERYBEAT_LOG_FILE="/var/log/celery/beat.log"
CELERY_BIN="/path/to/venv/bin/celery"
EOF

# Create celery directories
sudo mkdir -p /var/run/celery /var/log/celery
sudo chown www-data:www-data /var/run/celery /var/log/celery

# Install and configure Nginx
echo "🌐 Installing and configuring Nginx..."
sudo apt install nginx -y

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Install Docker and Docker Compose (optional)
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Set up monitoring
echo "📊 Setting up monitoring..."

# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
sudo rm -rf node_exporter-*

# Create node_exporter service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# Create prometheus user
sudo useradd --no-create-home --shell /bin/false prometheus

# Set up log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/onesoko > /dev/null <<EOF
/path/to/OneSoko/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
        systemctl restart celery
    endscript
}
EOF

# Create deployment script
echo "🚀 Creating deployment script..."
tee deploy.sh > /dev/null <<'EOF'
#!/bin/bash

# OneSoko Deployment Script

echo "🚀 Deploying OneSoko..."

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements_production.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart celery
sudo systemctl restart celerybeat
sudo systemctl reload nginx

# Health check
python manage.py check --deploy

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh

# Start services
echo "🔄 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable celery celerybeat node_exporter
sudo systemctl start celery celerybeat node_exporter nginx

echo "✅ OneSoko Backend Scalability Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update settings with your actual domain and credentials"
echo "2. Set up SSL certificates"
echo "3. Configure monitoring dashboards"
echo "4. Test load balancing"
echo "5. Set up automated backups"
echo ""
echo "🔧 Useful Commands:"
echo "  - Check Celery status: systemctl status celery"
echo "  - Monitor Redis: redis-cli monitor"
echo "  - View logs: tail -f logs/django.log"
echo "  - Deploy updates: ./deploy.sh"
