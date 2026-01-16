# Deployment Guide

**Date:** 2025-01-20  
**Next.js Version:** 16.1.3  
**Status:** ✅ Ready for Deployment

## Overview

This guide covers deploying AXIS BoardRoom to various platforms. The application is configured for:
- ✅ Node.js server deployment
- ✅ Docker container deployment
- ✅ Vercel deployment (recommended)
- ✅ Other platforms with adapters

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Environment variables configured

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# CORS Configuration (for API routes)
ALLOWED_ORIGIN=https://your-domain.com

# Maintenance Mode (optional)
MAINTENANCE_MODE=false

# Database/API Keys (if needed)
# DATABASE_URL=...
# API_KEY=...
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Vercel automatically detects Next.js and configures build settings
4. Add environment variables in project settings
5. Deploy!

#### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Features:**
- ✅ Automatic HTTPS
- ✅ Edge Network (CDN)
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Analytics and monitoring
- ✅ Zero configuration needed

### 2. Docker Deployment

#### Build Docker Image

```bash
# Build the image
docker build -t axis-boardroom .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e ALLOWED_ORIGIN=https://your-domain.com \
  axis-boardroom
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com
      - ALLOWED_ORIGIN=https://your-domain.com
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

#### Docker Platforms

- **Fly.io**: `fly deploy`
- **Railway**: Connect GitHub repo
- **DigitalOcean App Platform**: Use Dockerfile
- **Google Cloud Run**: `gcloud run deploy`
- **AWS ECS/Fargate**: Use Dockerfile

### 3. Node.js Server Deployment

#### Build and Start

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start production server
npm start
```

#### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "axis-boardroom" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Systemd Service

Create `/etc/systemd/system/axis-boardroom.service`:

```ini
[Unit]
Description=AXIS BoardRoom Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/axis-boardroom
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_SITE_URL=https://your-domain.com
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable axis-boardroom
sudo systemctl start axis-boardroom
```

### 4. Static Export (Limited Features)

**Note:** Static export doesn't support:
- Server Components with data fetching
- API Routes
- Dynamic routes with `generateStaticParams`
- Cache Components
- Server Actions

If you need static export:

```bash
# Add to next.config.ts
output: 'export'

# Build
npm run build

# Output will be in /out directory
```

## Platform-Specific Guides

### Vercel

**Configuration:** Automatic (no config needed)

**Environment Variables:**
- Set in Vercel Dashboard → Settings → Environment Variables
- Available for all environments (Production, Preview, Development)

**Custom Domain:**
- Add domain in Vercel Dashboard → Settings → Domains
- Vercel automatically configures SSL

### Railway

1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploy!

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

**Note:** Netlify requires adapter for full Next.js support.

## Build Optimization

### Standalone Output (Docker)

The `next.config.ts` includes `output: "standalone"` for Docker deployments. This creates a minimal `.next/standalone` directory with only necessary files.

### Build Verification

Before deploying, verify the build:

```bash
# Build locally
npm run build

# Test production build locally
npm start
```

## Health Checks

The application includes a health check endpoint:

```
GET /api/health
```

Use this for:
- Load balancer health checks
- Container orchestration (Kubernetes liveness/readiness)
- Monitoring systems

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in with Vercel
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: APM and monitoring

### Logging

Production logs are available via:
- Platform logs (Vercel, Railway, etc.)
- Docker logs: `docker logs <container-id>`
- PM2 logs: `pm2 logs`

## Security Checklist

Before deploying to production:

- ✅ Environment variables set correctly
- ✅ `NEXT_PUBLIC_SITE_URL` matches your domain
- ✅ `ALLOWED_ORIGIN` configured for CORS
- ✅ HTTPS enabled (automatic on most platforms)
- ✅ Security headers configured (via Proxy)
- ✅ Authentication enabled (if needed)
- ✅ Database credentials secured
- ✅ API keys not exposed in client code

## Troubleshooting

### Build Fails

1. Check Node.js version (requires 20+)
2. Verify all dependencies installed
3. Check for TypeScript errors: `npm run typecheck`
4. Review build logs for specific errors

### Runtime Errors

1. Check environment variables are set
2. Verify `NEXT_PUBLIC_SITE_URL` is correct
3. Check server logs for errors
4. Verify database/API connections

### Performance Issues

1. Enable Cache Components (already enabled)
2. Check image optimization settings
3. Review bundle size
4. Enable CDN caching

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      # Add deployment step for your platform
```

## References

- [Next.js Deployment Documentation](https://nextjs.org/docs/app/getting-started/deploying)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Status**: ✅ Ready for Production  
**Last Updated**: 2025-01-20
