# OneSoko Production Deployment Guide

This guide covers deploying the OneSoko Django backend with WSGI and React frontend in a production environment.

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone and prepare
git clone <your-repo>
cd OneSoko

# 2. Create environment file
cp .env.example .env
# Edit .env with your production values

# 3. Deploy with Docker
./deploy_production.sh docker yourdomain.com true
```

### Option 2: Manual Deployment

```bash
# 1. Deploy manually
./deploy_production.sh manual yourdomain.com

# 2. Setup systemd service (optional)
./deploy_production.sh systemd yourdomain.com true
```

## 📋 Prerequisites

### For Docker Deployment
- Docker (20.10+)
- Docker Compose (2.0+)
- 2GB+ RAM
- 10GB+ disk space

### For Manual Deployment
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Redis 7+
- Nginx
- 4GB+ RAM (recommended)

## 🔧 Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Essential settings
SECRET_KEY=your-super-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=mysql://user:password@host:port/database
REDIS_URL=redis://localhost:6379/1

# Email settings
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security (for HTTPS)
SECURE_SSL_REDIRECT=true
```

### 2. Domain Configuration

Update these files with your domain:
- `.env` - ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS
- `nginx-production.conf` - server_name directive
- SSL certificates (if using HTTPS)

## 🐳 Docker Deployment

### Build and Start Services

```bash
# Using the deployment script
./deploy_production.sh docker yourdomain.com

# Or manually with docker-compose
docker-compose -f docker-compose.prod.yml up -d --build
```

### Services Included

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy and static files |
| web | 8000 | Django application with Gunicorn |
| db | 3307 | MySQL database |
| redis | 6380 | Cache and session storage |
| celery | - | Background task worker |
| celery-beat | - | Scheduled tasks |

### Management Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run Django commands
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate
docker-compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic

# Restart services
docker-compose -f docker-compose.prod.yml restart web

# Update application
./deploy_production.sh update
```

## 🖥️ Manual Deployment

### 1. Install Dependencies

```bash
# Python dependencies
pip install -r requirements_production.txt
pip install gunicorn

# Build frontend
cd OneSokoApp/OneSokoFrontend
npm ci --only=production
npm run build
cd ../..
```

### 2. Configure Services

#### Gunicorn Service (systemd)

```bash
# Create service file
sudo cp deploy/onesoko.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable onesoko
sudo systemctl start onesoko
```

#### Nginx Configuration

```bash
# Copy nginx config
sudo cp nginx-production.conf /etc/nginx/sites-available/onesoko
sudo ln -s /etc/nginx/sites-available/onesoko /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update environment
echo "SECURE_SSL_REDIRECT=true" >> .env

# Restart services
sudo systemctl reload nginx
```

### Manual SSL Certificate

1. Place certificates in `ssl/` directory:
   - `ssl/cert.pem` - Certificate
   - `ssl/key.pem` - Private key

2. Update nginx configuration to enable HTTPS server block

3. Update environment variables for SSL

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Basic health check
curl http://yourdomain.com/api/health/

# Detailed health check
curl http://yourdomain.com/api/health/detailed/
```

### Log Files

| Service | Log Location |
|---------|--------------|
| Django | `/app/logs/django.log` |
| Gunicorn | `/app/logs/gunicorn_*.log` |
| Nginx | `/var/log/nginx/` |
| MySQL | Docker logs |

### Backup

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec db mysqldump -u onesoko_user -p onesoko_db > backup_$(date +%Y%m%d).sql

# Media files backup
tar -czf media_backup_$(date +%Y%m%d).tar.gz media/
```

### Updates

```bash
# Update application code
git pull origin main
./deploy_production.sh update

# Update dependencies
pip install -r requirements_production.txt --upgrade
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 🔧 Troubleshooting

### Common Issues

1. **Static files not loading**
   ```bash
   python manage.py collectstatic --clear --noinput
   ```

2. **Database connection errors**
   - Check MySQL service status
   - Verify DATABASE_URL in .env
   - Check firewall settings

3. **Frontend not updating**
   ```bash
   cd OneSokoApp/OneSokoFrontend
   npm run build
   cd ../..
   python manage.py collectstatic --noinput
   ```

4. **CORS errors**
   - Update CSRF_TRUSTED_ORIGINS in .env
   - Check nginx CORS headers
   - Verify ALLOWED_HOSTS

### Performance Optimization

1. **Enable Redis caching**
   ```python
   # In settings_production.py
   CACHES = {
       'default': {
           'BACKEND': 'django_redis.cache.RedisCache',
           'LOCATION': os.environ.get('REDIS_URL'),
       }
   }
   ```

2. **Database optimization**
   - Enable query optimization
   - Add database indexes
   - Configure connection pooling

3. **Static file optimization**
   - Enable gzip compression
   - Use CDN for static files
   - Optimize images

## 📝 Security Checklist

- [ ] SECRET_KEY is unique and secure
- [ ] DEBUG=False in production
- [ ] HTTPS enabled with valid certificate
- [ ] Security headers configured
- [ ] Database credentials secured
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## 🚀 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use multiple Django instances behind a load balancer
2. **Database**: Consider read replicas for high traffic
3. **Redis Cluster**: For high-availability caching
4. **CDN**: Use CloudFlare or AWS CloudFront for static files

### Vertical Scaling

1. **Server Resources**: Increase CPU/RAM as needed
2. **Database Tuning**: Optimize MySQL configuration
3. **Gunicorn Workers**: Adjust worker count based on CPU cores

## 📞 Support

For deployment issues:
1. Check logs first
2. Review this documentation
3. Check GitHub issues
4. Contact support team

---

**Happy Deploying! 🎉**
