/**
 * Pino Logger for API Routes ONLY
 * 
 * This is the FULL Pino logger with all features.
 * ONLY use this in:
 * - API routes (/app/api/*)
 * - Server actions (marked with 'use server')
 * - Any explicitly dynamic context
 * 
 * DO NOT use in:
 * - Server components
 * - Layouts
 * - Anything that prerenders
 * 
 * For those contexts, use logger-safe.ts instead.
 */

import 'server-only'
import pino from 'pino'
import { err as errSerializer } from 'pino-std-serializers'
import { trace } from '@opentelemetry/api'

// Redaction paths for sensitive data
const REDACT_PATHS = [
  'authorization', 'cookie', 'password', 'token', 'secret', 'apiKey',
  'req.headers.authorization', 'req.headers.cookie',
  '*.password', '*.token', '*.secret', '*.apiKey', '*.creditCard'
]

// Base Pino logger - ONLY for API routes
export const apiLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Redact sensitive fields
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]'
  },
  
  // Standard serializers
  serializers: {
    err: errSerializer,
  },
  
  // Add trace context to every log
  mixin() {
    const span = trace.getActiveSpan()
    if (span) {
      const spanContext = span.spanContext()
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
      }
    }
    return {}
  },
  
  // Transport: pretty in dev, JSON in prod
  transport: process.env.NODE_ENV === 'development'
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

// Types
export interface LogContext {
  event?: string
  scope?: string
  reqId?: string
  entity?: string
  entityId?: string
  step?: string
  ok?: boolean
  durationMs?: number
  [key: string]: unknown
}

// Child logger factory for API routes
export function createApiLogger(scope: string, defaultContext: LogContext = {}) {
  return apiLogger.child({ scope, ...defaultContext })
}

// Auto start/ok/fail wrapper with timing for API routes
export async function withApiLog<T>(
  log: pino.Logger,
  event: string,
  ctx: LogContext,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  log.info({ event: `${event}.start`, ...ctx }, `${event} started`)
  
  try {
    const result = await fn()
    const durationMs = Math.round(performance.now() - start)
    log.info({ event: `${event}.ok`, ok: true, durationMs, ...ctx }, `${event} completed`)
    return result
  } catch (error) {
    const durationMs = Math.round(performance.now() - start)
    log.error({ event: `${event}.fail`, ok: false, durationMs, err: error, ...ctx }, `${event} failed`)
    throw error
  }
}

// Re-export types
export type { Logger } from 'pino'
