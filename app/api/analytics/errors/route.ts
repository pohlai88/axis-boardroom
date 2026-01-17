/**
 * Error Tracking Analytics Endpoint
 * 
 * Receives and stores error reports from the client.
 * Self-hosted error tracking - no external dependencies.
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
  createErrorInputSchema, 
  type ErrorApi,
  type CreateErrorInput 
} from "@/lib/contracts";

// In-memory storage (replace with database in production)
const errorsStore: ErrorApi[] = [];

// Keep only last 500 errors to prevent memory issues
const MAX_ERRORS = 500;

export async function POST(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.analytics', { reqId })
  
  return withApiLog(log, 'analytics.errors.ingest', {}, async () => {
    const body = await request.json();
    
    // Validate input
    const validation = createErrorInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid error data",
            issues: validation.error.issues 
          }
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const url = request.headers.get("referer") || request.url;

    const storedError: ErrorApi = {
      id: Math.floor(Math.random() * 1000000), // Temporary ID for in-memory storage
      ...validation.data,
      filename: validation.data.filename ?? null,
      lineno: validation.data.lineno ?? null,
      colno: validation.data.colno ?? null,
      error: validation.data.error ?? null,
      stack: validation.data.stack ?? null,
      errorType: validation.data.errorType ?? null,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      url,
      userAgent: userAgent || null,
    };

    // Add to store
    errorsStore.push(storedError);

    // Keep only recent errors
    if (errorsStore.length > MAX_ERRORS) {
      errorsStore.shift();
    }

    // Invalidate cache when new data is added
    updateTag('analytics-errors');

    log.error({ 
      event: 'analytics.errors.ingest.ok',
      errorMessage: storedError.message,
      filename: storedError.filename,
      storeSize: errorsStore.length
    }, `Client error tracked: ${storedError.message}`)

    return NextResponse.json({ ok: true, data: storedError });
  }).catch((error) => {
    log.error({ event: 'analytics.errors.ingest.error', error }, 'Failed to store error')
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: "Failed to store error" } },
      { status: 500 }
    );
  });
}

// Cached function to compute error data (reads from closure)
// Uses remote cache to share expensive computations across serverless instances
async function getErrorsData(limit: number) {
  'use cache: remote'
  cacheTag('analytics-errors')
  cacheLife({ expire: 30 }) // Cache for 30 seconds - error data changes frequently
  
  // Get most recent errors
  const recent = errorsStore
    .sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, limit);

  // Group by error message
  const grouped = recent.reduce(
    (acc, error) => {
      const key = error.message || "Unknown error";
      if (!acc[key]) {
        acc[key] = {
          message: key,
          count: 0,
          firstSeen: error.timestamp || new Date().toISOString(),
          lastSeen: error.timestamp || new Date().toISOString(),
          errors: [],
        };
      }
      acc[key].count++;
      if (error.timestamp) {
        acc[key].lastSeen = error.timestamp;
      }
      acc[key].errors.push(error);
      return acc;
    },
    {} as Record<
      string,
      {
        message: string;
        count: number;
        firstSeen: string;
        lastSeen: string;
        errors: ErrorApi[];
      }
    >
  );

  return {
    errors: recent,
    grouped: Object.values(grouped).sort((a, b) => b.count - a.count),
    total: errorsStore.length,
  };
}

// GET endpoint to retrieve errors (for dashboard)
export async function GET(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.analytics', { reqId })
  
  return withApiLog(log, 'analytics.errors.query', {}, async () => {
    // Read searchParams outside cached scope (Next.js best practice)
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Call cached function with serializable arguments
    const data = await getErrorsData(limit);

    log.info({ 
      event: 'analytics.errors.query.ok', 
      limit, 
      resultCount: data.errors.length,
      groupedCount: data.grouped.length
    }, `Error analytics query completed`)

    return NextResponse.json(data);
  }).catch((error) => {
    return NextResponse.json(
      { error: "Failed to retrieve errors" },
      { status: 500 }
    );
  });
}
