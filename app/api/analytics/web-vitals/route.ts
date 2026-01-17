/**
 * Web Vitals Analytics Endpoint
 * 
 * Receives and stores Web Vitals metrics from the client.
 * Self-hosted analytics - no external dependencies.
 * Uses Cache Components with remote caching for optimal performance.
 * 
 * Note: Currently uses in-memory storage. In production, replace with a database
 * (PostgreSQL, MongoDB, or Redis) to ensure data persistence across serverless instances.
 * Remote caching helps share expensive computations across instances, but the underlying
 * data source should be persistent for production use.
 */

import { NextRequest, NextResponse } from "next/server";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { createApiLogger, withApiLog } from "@/lib/core/logger-api";
import { z } from "zod";
import { 
  createWebVitalInputSchema, 
  type WebVitalApi,
  type CreateWebVitalInput 
} from "@/lib/contracts";

// In-memory storage (replace with database in production)
const metricsStore: WebVitalApi[] = [];

// Keep only last 1000 metrics to prevent memory issues
const MAX_METRICS = 1000;

export async function POST(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.analytics', { reqId })
  
  return withApiLog(log, 'analytics.vitals.ingest', {}, async () => {
    const body = await request.json();
    
    // Validate input
    const validation = createWebVitalInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid web vital data",
            issues: validation.error.issues 
          }
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const url = request.headers.get("referer") || request.url;

    const storedMetric: WebVitalApi = {
      id: Math.floor(Math.random() * 1000000), // Temporary ID for in-memory storage
      ...validation.data,
      delta: validation.data.delta ?? null,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      url,
      userAgent: userAgent || null,
    };

    // Add to store
    metricsStore.push(storedMetric);

    // Keep only recent metrics
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift();
    }

    // Invalidate cache when new data is added
    updateTag('analytics-web-vitals');

    log.info({ 
      event: 'analytics.vitals.ingest.ok', 
      metricName: storedMetric.name, 
      value: storedMetric.value,
      storeSize: metricsStore.length 
    }, `Web vital ingested: ${storedMetric.name}`)

    return NextResponse.json({ ok: true, data: storedMetric });
  }).catch((error) => {
    log.error({ event: 'analytics.vitals.ingest.error', error }, 'Failed to store metric')
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: "Failed to store metric" } },
      { status: 500 }
    );
  });
}

// Cached function to compute metrics (reads from closure)
// Uses remote cache to share expensive computations across serverless instances
async function getWebVitalsData(name: string | null, limit: number) {
  'use cache: remote'
  cacheTag('analytics-web-vitals')
  cacheLife({ expire: 30 }) // Cache for 30 seconds - analytics data changes frequently
  
  let filtered = [...metricsStore];

  if (name) {
    filtered = filtered.filter((m) => m.name === name);
  }

  // Get most recent metrics
  const recent = filtered
    .sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, limit);

  // Calculate aggregates
  const aggregates = recent.reduce(
    (acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          values: [],
        };
      }
      const stats = acc[metric.name];
      const numValue = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
      stats.count++;
      stats.sum += numValue;
      stats.min = Math.min(stats.min, numValue);
      stats.max = Math.max(stats.max, numValue);
      stats.values.push(numValue);
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        sum: number;
        min: number;
        max: number;
        values: number[];
      }
    >
  );

  // Calculate percentiles
  const percentiles = Object.entries(aggregates).reduce(
    (acc, [name, stats]) => {
      const sorted = [...stats.values].sort((a, b) => a - b);
      acc[name] = {
        count: stats.count,
        avg: stats.sum / stats.count,
        min: stats.min,
        max: stats.max,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
      return acc;
    },
    {} as Record<string, any>
  );

  return {
    metrics: recent,
    aggregates: percentiles,
    total: metricsStore.length,
  };
}

// GET endpoint to retrieve metrics (for dashboard)
export async function GET(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.analytics', { reqId })
  
  return withApiLog(log, 'analytics.vitals.query', {}, async () => {
    // Read searchParams outside cached scope (Next.js best practice)
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name"); // Filter by metric name
    const limit = parseInt(searchParams.get("limit") || "100");

    // Call cached function with serializable arguments
    const data = await getWebVitalsData(name, limit);

    log.info({ 
      event: 'analytics.vitals.query.ok', 
      metricName: name, 
      limit, 
      resultCount: data.metrics.length 
    }, `Web vitals query completed`)

    return NextResponse.json(data);
  }).catch((error) => {
    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 }
    );
  });
}
