/**
 * Client Instrumentation
 * 
 * Runs before React hydration to set up:
 * - Global error tracking
 * - Unhandled promise rejection tracking
 * - Navigation monitoring
 * 
 * Uses Next.js 15.3+ instrumentation-client hooks.
 */

import { clientLog } from './lib/client/logger'

// Global error tracking (before React hydration)
window.addEventListener('error', (event) => {
  clientLog.error({
    event: 'error.uncaught',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  }, 'Uncaught client error')
})

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  clientLog.error({
    event: 'error.unhandledrejection',
    reason: String(event.reason),
    stack: event.reason?.stack,
  }, 'Unhandled promise rejection')
})

// Navigation tracking (Next.js 15.3+ hook)
export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse'
) {
  clientLog.info({
    event: 'ui.navigation.start',
    url,
    navigationType,
  }, `Navigation: ${navigationType} to ${url}`)
}
