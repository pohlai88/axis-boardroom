# Analytics Implementation

**Date:** 2025-01-20  
**Next.js Version:** 16.1.3  
**Status:** ✅ Complete - Self-Hosted

## Overview

**100% Self-Hosted Analytics** - No external dependencies! Built using Next.js API routes and in-memory storage. All analytics data stays on your server.

Comprehensive analytics implementation using:
- Next.js built-in Web Vitals reporting
- Client instrumentation for error tracking
- Self-hosted API endpoints
- Real-time analytics dashboard

## Implementation

### 1. Self-Hosted Analytics API

**Files:**
- `app/api/analytics/web-vitals/route.ts` - Web Vitals endpoint
- `app/api/analytics/errors/route.ts` - Error tracking endpoint

**Features:**
- ✅ In-memory storage (replace with database in production)
- ✅ Automatic data aggregation (percentiles, averages)
- ✅ Error grouping by message
- ✅ GET endpoints for dashboard data
- ✅ No external dependencies

**Storage:**
- Currently uses in-memory arrays (for demo)
- In production, replace with:
  - PostgreSQL/MongoDB for persistent storage
  - Redis for high-performance caching
  - Time-series database for historical data

### 2. Analytics Dashboard

**File:** `app/(prod)/analytics/page.tsx`

**Features:**
- ✅ Real-time Web Vitals visualization
- ✅ Error tracking and grouping
- ✅ Auto-refresh every 30 seconds
- ✅ Manual refresh button
- ✅ Percentile calculations (P50, P75, P95, P99)
- ✅ Status badges (Good/Needs Improvement/Poor)

**Access:** `/analytics`

### 3. Web Vitals Component

**File:** `app/_components/web-vitals.tsx`

**Features:**
- ✅ Reports all Core Web Vitals metrics
- ✅ Uses `useReportWebVitals` hook (Next.js built-in)
- ✅ Sends metrics to analytics endpoint (if configured)
- ✅ Google Analytics integration (if gtag is available)
- ✅ Silent failure (doesn't block user experience)
- ✅ Development logging

**Metrics Tracked:**
- **TTFB** - Time to First Byte
- **FCP** - First Contentful Paint
- **LCP** - Largest Contentful Paint
- **FID** - First Input Delay
- **CLS** - Cumulative Layout Shift
- **INP** - Interaction to Next Paint

### 4. Client Instrumentation

**File:** `instrumentation-client.ts`

**Features:**
- ✅ Global error tracking
- ✅ Unhandled promise rejection tracking
- ✅ Performance monitoring (long tasks)
- ✅ Runs before app code executes
- ✅ Silent error reporting

**What it tracks:**
- JavaScript errors
- Unhandled promise rejections
- Long-running tasks (>50ms)
- Error context (URL, user agent, stack trace)

### 5. Integration

**File:** `app/layout.tsx`

- ✅ WebVitals component added to root layout
- ✅ Minimal performance impact (separate client component)
- ✅ Runs on every page load
- ✅ Automatically sends to self-hosted endpoints

**Note:** `instrumentation-client.ts` is automatically detected by Next.js - no configuration needed!

## Self-Hosted Benefits

### ✅ No External Dependencies
- All data stays on your server
- No third-party tracking scripts
- GDPR/privacy compliant by default
- Full control over data

### ✅ Zero Cost
- No analytics service fees
- No API rate limits
- No data export restrictions

### ✅ Customizable
- Add custom metrics easily
- Full control over data retention
- Custom dashboards and reports
- Integrate with your existing tools

## Production Upgrade Path

### Replace In-Memory Storage

**Option 1: PostgreSQL**
```ts
// app/api/analytics/web-vitals/route.ts
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const metric = await request.json()
  await db.webVitals.create({ data: metric })
  // ...
}
```

**Option 2: Redis (High Performance)**
```ts
import { redis } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const metric = await request.json()
  await redis.lpush('web-vitals', JSON.stringify(metric))
  await redis.ltrim('web-vitals', 0, 999) // Keep last 1000
  // ...
}
```

**Option 3: Time-Series Database**
- TimescaleDB (PostgreSQL extension)
- InfluxDB
- Prometheus

## Configuration

### Default Endpoints

The analytics automatically use these endpoints (no configuration needed):
- Web Vitals: `/api/analytics/web-vitals`
- Errors: `/api/analytics/errors`

### Custom Endpoints (Optional)

If you want to use external services alongside self-hosted:

```bash
# Use custom endpoints
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-service.com/vitals
NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT=https://your-service.com/errors
```

## Configuration

### Environment Variables

Add to `.env.local` or your deployment platform:

```bash
# Analytics endpoint (optional)
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/web-vitals

# Error tracking endpoint (optional)
NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT=https://your-error-api.com/errors
```

### Google Analytics

To enable Google Analytics integration:

1. Add Google Analytics script to your layout
2. The WebVitals component will automatically send metrics to gtag

Example Google Analytics setup:

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

## Usage

### Custom Analytics Endpoint

Create an API route to receive Web Vitals:

```tsx
// app/api/analytics/web-vitals/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const metric = await request.json()
  
  // Store in database, send to analytics service, etc.
  console.log('Web Vital:', metric)
  
  return NextResponse.json({ success: true })
}
```

Then set:
```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics/web-vitals
```

### Custom Error Tracking

Create an API route for error tracking:

```tsx
// app/api/analytics/errors/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const error = await request.json()
  
  // Send to Sentry, LogRocket, etc.
  console.error('Error:', error)
  
  return NextResponse.json({ success: true })
}
```

Then set:
```bash
NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT=/api/analytics/errors
```

## Metrics Reference

### Core Web Vitals

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | First Input Delay | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **INP** | Interaction to Next Paint | ≤ 200ms | 200ms - 500ms | > 500ms |

### Other Metrics

- **TTFB** - Time to First Byte (server response time)
- **FCP** - First Contentful Paint (first content visible)

## Best Practices

### 1. Performance

- ✅ Uses `navigator.sendBeacon()` for non-blocking sends
- ✅ Falls back to `fetch()` with `keepalive: true`
- ✅ Silent failures (doesn't affect user experience)
- ✅ Minimal bundle size impact

### 2. Privacy

- ✅ No personal data collected by default
- ✅ Configurable endpoints (you control data)
- ✅ Complies with GDPR (no automatic tracking)

### 3. Reliability

- ✅ Error handling for network failures
- ✅ Works offline (queues for later)
- ✅ Doesn't block page navigation

## Integration with Analytics Services

### Vercel Analytics

Vercel provides automatic Web Vitals collection. To enable:

1. Install `@vercel/analytics`
2. Add to your layout:

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry

For error tracking with Sentry:

```tsx
// instrumentation-client.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // ... other config
})

window.addEventListener('error', (event) => {
  Sentry.captureException(event.error)
})
```

### Custom Analytics Service

The Web Vitals component sends metrics in this format:

```json
{
  "name": "LCP",
  "value": 1234.5,
  "id": "v3-1234567890-1234567890123",
  "delta": 1234.5,
  "entries": [...]
}
```

## Testing

### Development

In development mode, metrics are logged to console:

```
[Web Vitals] { name: 'LCP', value: 1234.5, ... }
```

### Production

In production, metrics are sent to configured endpoints silently.

## Monitoring

### Recommended Tools

- **Vercel Analytics** - Automatic Web Vitals (if using Vercel)
- **Google Analytics** - Web Vitals dashboard
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay and analytics
- **Datadog** - APM and real user monitoring

## References

- [Next.js Web Vitals Documentation](https://nextjs.org/docs/app/getting-started/analytics)
- [Web Vitals API Reference](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google Analytics Web Vitals](https://github.com/GoogleChrome/web-vitals#send-the-results-to-google-analytics)

---

**Status**: ✅ Complete  
**Ready for Production**: After configuring analytics endpoints
