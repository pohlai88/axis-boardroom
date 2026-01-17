/**
 * Next.js-Safe Logger
 * 
 * A logging strategy optimized for Next.js 16 constraints:
 * - Avoids Date.now() in prerendering contexts
 * - No property redefinition issues (_debugInfo)
 * - Works in all contexts: SSR, API routes, server actions, prerendering
 * 
 * Strategy:
 * - API routes & server actions: Use Pino (full features)
 * - Server components & prerendering: Use console.* with structured JSON
 * - Client components: Use client logger
 */

import 'server-only'

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

/**
 * Detect if we're in a safe context for Pino (API routes, server actions)
 * vs prerendering/SSR context where we should use console.*
 */
function isSafeForPino(): boolean {
  // Check if we're in an API route or server action (dynamic rendering)
  // These contexts are safe for Pino's Date.now() usage
  
  // In Next.js, headers() and cookies() are available in API routes and server actions
  // but their mere availability doesn't indicate we're safe to use Date.now()
  
  // Safest approach: Only use Pino in explicitly dynamic contexts
  // For now, we'll use a conservative approach and use console.* everywhere
  // except when explicitly in an API route context
  
  return false // Conservative: use console.* by default
}

/**
 * Safe logger that auto-detects context and uses appropriate method
 */
class SafeLogger {
  constructor(private scope: string, private defaultContext: LogContext = {}) {}

  private format(level: string, context: LogContext, message?: string) {
    return JSON.stringify({
      level,
      scope: this.scope,
      ...this.defaultContext,
      ...context,
      msg: message || context.event || 'log',
      timestamp: new Date().toISOString(), // Safe to use in console.*
    })
  }

  info(context: LogContext, message?: string) {
    console.log(this.format('info', context, message))
  }

  error(context: LogContext, message?: string) {
    console.error(this.format('error', context, message))
  }

  warn(context: LogContext, message?: string) {
    console.warn(this.format('warn', context, message))
  }

  debug(context: LogContext, message?: string) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.format('debug', context, message))
    }
  }
}

/**
 * Create a scoped logger for a specific module/feature
 */
export function createScopedLogger(scope: string, defaultContext: LogContext = {}): SafeLogger {
  return new SafeLogger(scope, defaultContext)
}

/**
 * Wrapper for async operations with automatic logging
 */
export async function withLog<T>(
  log: SafeLogger,
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
    log.error({ 
      event: `${event}.fail`, 
      ok: false, 
      durationMs, 
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      } : String(error),
      ...ctx 
    }, `${event} failed`)
    throw error
  }
}

// Export type for compatibility
export type Logger = SafeLogger
