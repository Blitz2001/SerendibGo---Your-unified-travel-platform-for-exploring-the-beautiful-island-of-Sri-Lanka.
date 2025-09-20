# 🚀 SerendibGo Production Deployment Guide

This guide will help you deploy SerendibGo to production using Docker and Docker Compose.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- MongoDB Atlas account (or self-hosted MongoDB)

## 🔧 Configuration

### 1. Environment Setup

Copy the production environment template:
```bash
cp env.production.template .env.production
```

Edit `.env.production` with your actual values:
- Database connection string
- JWT secret (use a strong, random string)
- API keys for external services
- Domain name

### 2. SSL Certificates

Place your SSL certificates in the `ssl/` directory:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - Private key

For Let's Encrypt:
```bash
mkdir ssl
# Copy certificates from Let's Encrypt
```

## 🚀 Deployment

### Option 1: Using Deployment Scripts

**Linux/Mac:**
```bash
./deploy.sh production your-domain.com
```

**Windows:**
```cmd
deploy.bat production
```

### Option 2: Manual Deployment

1. **Build and start services:**
```bash
docker-compose build
docker-compose up -d
```

2. **Check health:**
```bash
curl http://localhost:5000/health
```

3. **View logs:**
```bash
docker-compose logs -f app
```

## 🔍 Monitoring

### Health Checks

- **Application Health:** `https://your-domain.com/health`
- **API Status:** `https://your-domain.com/api/status`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f nginx
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check container health
docker-compose ps
```

## 🔧 Maintenance

### Updates

1. **Pull latest changes:**
```bash
git pull origin main
```

2. **Rebuild and restart:**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Backups

1. **Database backup:**
```bash
docker-compose exec mongodb mongodump --out /data/backup
```

2. **Restore database:**
```bash
docker-compose exec mongodb mongorestore /data/backup
```

### Scaling

To scale the application:
```bash
docker-compose up -d --scale app=3
```

## 🛡️ Security

### Firewall Configuration

Only allow traffic on:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH)

### SSL/TLS

- Use strong SSL certificates
- Enable HSTS headers
- Regular certificate renewal

### Rate Limiting

Configured in `nginx.conf`:
- API endpoints: 10 requests/second
- Login endpoint: 5 requests/minute

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start:**
```bash
docker-compose logs app
```

2. **Database connection issues:**
```bash
docker-compose logs mongodb
```

3. **SSL certificate problems:**
```bash
docker-compose logs nginx
```

### Performance Issues

1. **High memory usage:**
```bash
docker stats
```

2. **Slow database queries:**
- Check MongoDB logs
- Monitor query performance

### Security Issues

1. **Check for vulnerabilities:**
```bash
docker scan serendibgo_app
```

2. **Update dependencies:**
```bash
docker-compose build --no-cache
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify configuration: `.env.production`
3. Test health endpoints
4. Contact the development team

---

**SerendibGo** - Production Ready! 🌴✨
