/**
 * Log Ingestion Endpoint
 * 
 * Secured endpoint for receiving client-side logs.
 * 
 * Protections:
 * - Rate limiting (10 requests/second per IP)
 * - Size limit (10KB max payload)
 * - Event prefix allowlist (ui.*, perf.*, error.*)
 * - Forbidden field stripping (cookie, authorization, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiLogger } from '@/lib/core/logger-api'
import { clientLogBatchSchema } from '@/lib/contracts'

const log = createApiLogger('api.logs')

// Rate limiting (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW_MS = 1000 // 1 second

// Forbidden fields (never accept from client)
const FORBIDDEN_FIELDS = ['cookie', 'authorization', 'token', 'password', 'secret']

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS })
    return false
  }
  
  entry.count++
  return entry.count > RATE_LIMIT
}

function sanitizeLogEntry(entry: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(entry)) {
    if (!FORBIDDEN_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = value
    }
  }
  return sanitized
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  
  // Rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' } },
      { status: 429 }
    )
  }
  
  // Size limit (10KB)
  const contentLength = parseInt(request.headers.get('content-length') || '0')
  if (contentLength > 10240) {
    return NextResponse.json(
      { ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' } },
      { status: 413 }
    )
  }
  
  try {
    const body = await request.json()
    
    // Validate with Zod
    const validation = clientLogBatchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid log format',
            issues: validation.error.issues.map(issue => ({
              path: issue.path as (string | number)[],
              message: issue.message,
            }))
          }
        },
        { status: 400 }
      )
    }
    
    const { logs } = validation.data
    
    // Process each log entry
    for (const entry of logs) {
      const sanitized = sanitizeLogEntry(entry as Record<string, unknown>)
      
      // Log to server
      switch (entry.level) {
        case 'debug':
          log.debug(sanitized, entry.message)
          break
        case 'info':
          log.info(sanitized, entry.message)
          break
        case 'warn':
          log.warn(sanitized, entry.message)
          break
        case 'error':
        case 'fatal':
          log.error(sanitized, entry.message)
          break
      }
    }
    
    return NextResponse.json({ ok: true, processed: logs.length })
  } catch (err) {
    log.error({ err }, 'Failed to process log batch')
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to process logs' } },
      { status: 500 }
    )
  }
}
