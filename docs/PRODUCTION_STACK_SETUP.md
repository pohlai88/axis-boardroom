# Production Stack Setup Guide

**Date:** 2025-01-20  
**Next.js Version:** 16.1.3  
**Status:** 🚀 Production-Ready Stack

## Overview

Complete production-ready stack with:
- **Drizzle ORM** - Type-safe database queries
- **Zod-Drizzle** - Schema validation
- **Neon DB** - Serverless PostgreSQL
- **Pino** - Structured logging
- **Nginx** - Reverse proxy/load balancer
- **Kong** - API gateway

## Recommended Additional Tools

### ✅ Already Included
- Next.js 16.1.3
- Zustand (state management)
- TanStack Query (data fetching)
- Zod (validation)
- Docker (containerization)

### 🔧 Recommended Additions

1. **Drizzle Kit** - Database migrations
2. **@env/zod** or **zod-env** - Environment variable validation
3. **Redis** - Caching layer
4. **BullMQ** - Background job queue
5. **OpenTelemetry** - Observability/monitoring
6. **Vitest** - Testing framework
7. **Playwright** - E2E testing
8. **GitHub Actions** - CI/CD

## Installation Guide

### 1. Core Database Stack

```bash
# Drizzle ORM and Neon
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit @types/pg

# Zod-Drizzle for schema validation
npm install zod-drizzle

# Pino for logging
npm install pino pino-pretty
```

### 2. Infrastructure

```bash
# Redis for caching
npm install ioredis @types/ioredis

# BullMQ for job queues
npm install bullmq ioredis

# Environment validation
npm install zod-env
```

### 3. Monitoring & Observability

```bash
# OpenTelemetry
npm install @opentelemetry/api @opentelemetry/sdk-node
npm install @opentelemetry/instrumentation-http
npm install @opentelemetry/instrumentation-fetch
```

### 4. Testing

```bash
# Vitest
npm install -D vitest @vitest/ui

# Playwright
npm install -D @playwright/test
npx playwright install
```

## Setup Instructions

### 1. Drizzle ORM + Neon DB

**File:** `lib/db/index.ts`

```ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

**File:** `lib/db/schema.ts`

```ts
import { pgTable, serial, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const webVitals = pgTable('web_vitals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: decimal('value', { precision: 10, scale: 3 }).notNull(),
  metricId: text('metric_id').notNull(),
  delta: decimal('delta', { precision: 10, scale: 3 }),
  url: text('url').notNull(),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const errors = pgTable('errors', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  filename: text('filename'),
  lineno: integer('lineno'),
  colno: integer('colno'),
  error: text('error'),
  stack: text('stack'),
  url: text('url').notNull(),
  userAgent: text('user_agent'),
  errorType: text('error_type'),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Zod schemas from Drizzle
export const insertWebVitalSchema = createInsertSchema(webVitals)
export const selectWebVitalSchema = createSelectSchema(webVitals)
```

**File:** `drizzle.config.ts`

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### 2. Environment Validation

**File:** `lib/env.ts`

```ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Next.js
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  
  // Analytics
  NEXT_PUBLIC_ANALYTICS_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT: z.string().url().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)
```

### 3. Pino Logger

**File:** `lib/logger.ts`

```ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})
```

### 4. Redis Cache

**File:** `lib/cache/redis.ts`

```ts
import Redis from 'ioredis'

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : null

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> {
  if (!redis) return fetcher()
  
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  
  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}
```

### 5. Nginx Configuration

**File:** `nginx.conf`

```nginx
upstream nextjs {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static assets
    location /_next/static {
        alias /app/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # All other requests
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Kong API Gateway

**File:** `kong.yml`

```yaml
_format_version: "3.0"

services:
  - name: axis-boardroom
    url: http://nginx:80
    routes:
      - name: api
        paths:
          - /api
        plugins:
          - name: rate-limiting
            config:
              minute: 100
              hour: 1000
          - name: cors
            config:
              origins:
                - "*"
              methods:
                - GET
                - POST
                - PUT
                - PATCH
                - DELETE
              headers:
                - Accept
                - Accept-Language
                - Content-Language
                - Content-Type
          - name: request-id
            config:
              header_name: X-Request-ID
```

### 7. Updated Database Layer

**File:** `lib/db/analytics.ts` (Updated)

```ts
import { db } from './index'
import { webVitals, errors } from './schema'
import { eq, desc, sql } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { getCached } from '@/lib/cache/redis'

export async function storeWebVital(metric: any) {
  try {
    const result = await db.insert(webVitals).values({
      name: metric.name,
      value: metric.value.toString(),
      metricId: metric.id,
      delta: metric.delta?.toString(),
      url: metric.url,
      userAgent: metric.userAgent,
      timestamp: new Date(metric.timestamp),
    }).returning()
    
    logger.info({ metricId: metric.id, name: metric.name }, 'Web vital stored')
    return result[0].id
  } catch (error) {
    logger.error({ error, metric }, 'Failed to store web vital')
    throw error
  }
}

export async function getWebVitalsAggregates(limit = 100) {
  return getCached(
    `web-vitals-aggregates:${limit}`,
    async () => {
      const result = await db
        .select({
          name: webVitals.name,
          count: sql<number>`count(*)`,
          avg: sql<number>`avg(${webVitals.value})`,
          min: sql<number>`min(${webVitals.value})`,
          max: sql<number>`max(${webVitals.value})`,
          p50: sql<number>`percentile_cont(0.5) within group (order by ${webVitals.value})`,
          p95: sql<number>`percentile_cont(0.95) within group (order by ${webVitals.value})`,
        })
        .from(webVitals)
        .where(sql`${webVitals.timestamp} > NOW() - INTERVAL '24 hours'`)
        .groupBy(webVitals.name)
        .limit(limit)
      
      return result.reduce((acc, row) => {
        acc[row.name] = {
          count: Number(row.count),
          avg: Number(row.avg),
          min: Number(row.min),
          max: Number(row.max),
          p50: Number(row.p50),
          p95: Number(row.p95),
        }
        return acc
      }, {} as Record<string, any>)
    },
    300 // 5 minutes cache
  )
}
```

## Docker Compose Setup

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: analytics
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/analytics
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - nextjs

  kong:
    image: kong:3.4
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
    volumes:
      - ./kong.yml:/kong/kong.yml:ro
    ports:
      - "8000:8000"
      - "8443:8443"
    depends_on:
      - nginx

volumes:
  postgres_data:
  redis_data:
```

## Migration Commands

```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema (dev only)
npm run db:push
```

**File:** `package.json` scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## What You Might Be Missing

### 🔴 Critical
1. **Database Migrations** - Drizzle Kit ✅ (included)
2. **Environment Validation** - Zod-env ✅ (included)
3. **Error Tracking** - Consider Sentry or self-hosted
4. **Monitoring** - OpenTelemetry + Prometheus/Grafana

### 🟡 Important
5. **Rate Limiting** - Kong ✅ (included)
6. **Caching** - Redis ✅ (included)
7. **Background Jobs** - BullMQ (for cleanup, email, etc.)
8. **File Storage** - S3, Cloudflare R2, or local

### 🟢 Nice to Have
9. **Testing** - Vitest + Playwright
10. **CI/CD** - GitHub Actions
11. **Email Service** - Resend, SendGrid
12. **Authentication** - NextAuth.js, Clerk
13. **Search** - Meilisearch, Algolia
14. **CDN** - Cloudflare, Vercel Edge

## Quick Start Checklist

- [ ] Install all packages
- [ ] Set up Neon DB (or local PostgreSQL)
- [ ] Configure environment variables
- [ ] Run Drizzle migrations
- [ ] Set up Redis (optional but recommended)
- [ ] Configure Nginx
- [ ] Set up Kong (optional)
- [ ] Update API routes to use Drizzle
- [ ] Add Pino logging
- [ ] Test locally
- [ ] Deploy to production

## Next Steps

1. **Start with Drizzle + Neon** - Core database layer
2. **Add Pino** - Logging is essential
3. **Set up Redis** - Performance boost
4. **Add Nginx** - Production-ready
5. **Kong** - If you need API gateway features

---

**Status**: 📋 Setup Guide Complete  
**Priority**: Start with Drizzle + Neon + Pino
