# Sign Vision - Production Deployment Guide

This guide covers deploying Sign Vision to production environments.

## Table of Contents
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Configuration](#environment-configuration)
- [Security Considerations](#security-considerations)

## Backend Deployment

### Option 1: Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add environment variables in Railway dashboard:
```
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://your-frontend-url.com
```

4. Upload your Google Cloud credentials as a secret file

5. Deploy:
```bash
railway up
```

### Option 2: Deploy to Heroku

1. Create a `Procfile` in backend directory:
```
web: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

2. Create `runtime.txt`:
```
python-3.9.18
```

3. Deploy:
```bash
heroku create your-app-name
heroku config:set GOOGLE_APPLICATION_CREDENTIALS="$(cat path/to/credentials.json)"
git push heroku main
```

### Option 3: Deploy to Google Cloud Run

1. Create `Dockerfile` in backend directory:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

2. Build and deploy:
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/sign-vision
gcloud run deploy sign-vision --image gcr.io/PROJECT-ID/sign-vision --platform managed
```

### Option 4: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. SSH into your server

2. Install dependencies:
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

3. Clone your repository and setup:
```bash
git clone your-repo
cd sign-vision/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. Create systemd service `/etc/systemd/system/signvision.service`:
```ini
[Unit]
Description=Sign Vision API
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/sign-vision/backend
Environment="PATH=/path/to/sign-vision/backend/venv/bin"
ExecStart=/path/to/sign-vision/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

5. Start service:
```bash
sudo systemctl start signvision
sudo systemctl enable signvision
```

6. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

7. Enable SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Frontend Deployment

### Option 1: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com/api
```

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

3. Configure environment variables in Netlify dashboard

### Option 3: Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/sign-vision",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/sign-vision/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

### Option 4: Deploy with Docker

1. Create `Dockerfile` in frontend directory:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run:
```bash
docker build -t sign-vision-frontend .
docker run -p 80:80 sign-vision-frontend
```

## Environment Configuration

### Backend Environment Variables

**Required:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGINS=https://your-frontend.com
```

**Optional:**
```bash
MAX_IMAGE_SIZE_MB=10
RATE_LIMIT_PER_MINUTE=30
SECRET_KEY=your-secret-key-for-jwt
```

### Frontend Environment Variables

```bash
VITE_API_URL=https://your-backend-api.com/api
```

## Database Setup for Production

### PostgreSQL on Heroku

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### PostgreSQL on Railway

1. Add PostgreSQL service in Railway dashboard
2. Copy connection string to `DATABASE_URL`

### Managed PostgreSQL (DigitalOcean, AWS RDS, etc.)

1. Create database instance
2. Note connection details
3. Update `DATABASE_URL` with connection string
4. Ensure firewall allows your backend server

## Security Considerations

### 1. HTTPS Only
Always use HTTPS in production. Use services like Let's Encrypt for free SSL certificates.

### 2. Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate credentials regularly

### 3. CORS Configuration
```python
# Only allow your frontend domain
CORS_ORIGINS=https://your-domain.com
```

### 4. Rate Limiting
Implement rate limiting to prevent abuse:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### 5. Input Validation
- Max file size limits are enforced
- File type validation is in place
- SQL injection protection via SQLAlchemy

### 6. API Key Protection
- Store Google Cloud credentials securely
- Use service accounts with minimal permissions
- Monitor API usage in Google Cloud Console

## Monitoring and Logging

### Application Monitoring

1. Add logging to backend:
```python
import logging
logging.basicConfig(level=logging.INFO)
```

2. Use monitoring services:
- Sentry for error tracking
- LogRocket for session replay
- Google Cloud Monitoring for API usage

### Performance Monitoring

1. Monitor API response times
2. Track Google Cloud API quotas
3. Monitor database performance
4. Set up uptime monitoring (UptimeRobot, Pingdom)

## Scaling Considerations

### Backend Scaling
- Use multiple worker processes: `-w 4`
- Implement caching for language lists
- Use CDN for static assets
- Consider Redis for session storage

### Database Scaling
- Add database indexes on frequently queried fields
- Implement connection pooling
- Consider read replicas for high traffic

### Cost Optimization
- Monitor Google Cloud API usage
- Implement client-side caching
- Compress images before sending to API
- Use appropriate instance sizes

## Backup and Recovery

### Database Backups

1. Automated daily backups:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

2. Store backups in cloud storage (S3, Google Cloud Storage)

### Application Backups
- Use version control (Git)
- Tag releases
- Maintain deployment documentation

## Health Checks

Add health check endpoint:
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",  # Check DB connection
        "apis": "operational"     # Check Google APIs
    }
```

## Rollback Strategy

1. Keep previous Docker images/builds
2. Use blue-green deployment
3. Test in staging environment first
4. Monitor error rates after deployment
5. Have rollback plan ready

## Support and Maintenance

### Regular Maintenance
- Update dependencies monthly
- Review security advisories
- Monitor API usage and costs
- Check error logs weekly

### Performance Tuning
- Optimize database queries
- Cache frequently accessed data
- Compress API responses
- Optimize images and assets

## Troubleshooting Production Issues

### High Latency
- Check Google Cloud API response times
- Review database query performance
- Monitor server resources

### API Quota Exceeded
- Implement caching
- Add user authentication and limits
- Upgrade Google Cloud API tier

### Database Connection Issues
- Check connection pool settings
- Verify firewall rules
- Monitor active connections

## Success Metrics

Track these metrics:
- API response time
- Success/error rates
- User engagement
- Google Cloud API costs
- Database performance

---

For development setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

