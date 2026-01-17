/**
 * Server Instrumentation
 * 
 * Initializes OpenTelemetry and Pino logger for production observability.
 * This file runs once when the Next.js server starts.
 * 
 * Features:
 * - Auto-instrumented traces for routes, fetch, render (via @vercel/otel)
 * - Runtime-aware Pino initialization (Node.js only)
 * - Automatic uncaught server error tracking
 */

import { registerOTel } from '@vercel/otel'

// Initialize Zod configuration early
import '@/lib/core/zod-config'

export function register() {
  // Initialize OpenTelemetry (auto-instruments Next.js)
  registerOTel({ serviceName: 'axis-boardroom' })
  
  // Conditionally load API logger (Pino) for Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Side-effect: initializes Pino with transports for API routes
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./lib/core/logger-api')
  }
}

// Automatic server error tracking (Next.js 15+)
// NOTE: This handler uses console.error to avoid Date.now() issues with Pino during prerendering.
// Pino uses Date.now() internally for timestamps, which Next.js doesn't allow before accessing
// uncached data. We use console.error which doesn't have this restriction.
export async function onRequestError(
  err: Error & { digest?: string },
  request: { path: string; method: string; headers: Record<string, string> },
  context: { 
    routerKind: 'Pages Router' | 'App Router'
    routeType: 'render' | 'route' | 'action' | 'proxy'
  }
) {
  // Extract request data (no Date.now() used here)
  const path = request.path
  const method = request.method
  const routeType = context.routeType
  const routerKind = context.routerKind
  const digest = err.digest
  const errorMessage = err.message
  const stack = err.stack
  
  // Extract headers for logging context
  const userAgent = request.headers['user-agent'] || request.headers['User-Agent'] || ''
  const referer = request.headers['referer'] || request.headers['Referer'] || ''
  
  // Use console.error to avoid Date.now() issues with Pino during prerendering
  // This ensures we don't trigger Next.js's prerender restrictions
  console.error('[Error Handler] Uncaught server error:', {
    event: 'request.error.uncaught',
    path,
    method,
    routeType,
    routerKind,
    digest,
    errorMessage,
    userAgent,
    referer,
    stack: stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
  })
  
  // Note: We intentionally avoid using Pino logger here because it uses Date.now() internally
  // for timestamps, which Next.js doesn't allow before accessing uncached data during
  // prerendering. Console.error doesn't have this restriction and works in all contexts.
}
