/**
 * Next.js-Safe Logger - Default Export
 * 
 * This is the SAFE logger that works in ALL Next.js 16 contexts:
 * - Server components (prerendering)
 * - Layouts
 * - API routes
 * - Server actions
 * - SSR
 * 
 * Strategy:
 * - Uses console.* with structured JSON logging
 * - No Date.now() before uncached data
 * - No property redefinition issues
 * - No Pino complexity in prerendering contexts
 * 
 * For API routes that need full Pino features, use logger-api.ts directly.
 */

import 'server-only'

// Export the safe logger by default
export * from './logger-safe'

// Re-export types for consumers
export type { LogContext, Logger } from './logger-safe'
