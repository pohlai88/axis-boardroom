/**
 * Client Logger Facade
 * 
 * Batched logging that POSTs to /api/logs endpoint.
 * 
 * Features:
 * - Event prefix allowlist (ui.*, perf.*, error.*)
 * - Automatic batching (50ms debounce, max 20 logs)
 * - Graceful degradation (logs locally if send fails)
 * - Page unload flushing with keepalive
 */

'use client'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  event?: string
  msg?: string
  timestamp: string
  [key: string]: unknown
}

// Event prefix allowlist (only these get sent to server)
const ALLOWED_PREFIXES = ['ui.', 'perf.', 'error.']

// Batch buffer
let logBuffer: LogEntry[] = []
let flushTimeout: ReturnType<typeof setTimeout> | null = null

const BATCH_DELAY_MS = 50
const MAX_BATCH_SIZE = 20

function shouldSend(event?: string): boolean {
  if (!event) return false
  return ALLOWED_PREFIXES.some(prefix => event.startsWith(prefix))
}

async function flushLogs() {
  if (logBuffer.length === 0) return
  
  const batch = logBuffer.splice(0, MAX_BATCH_SIZE)
  
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: batch }),
      keepalive: true, // Survive page unload
    })
  } catch (e) {
    // Fail silently - don't break the app for logging
    console.warn('[clientLog] Failed to send logs:', e)
  }
}

function queueLog(entry: LogEntry) {
  if (!shouldSend(entry.event)) {
    // Log locally but don't send to server
    console[entry.level]?.(entry.msg, entry)
    return
  }
  
  logBuffer.push(entry)
  
  if (logBuffer.length >= MAX_BATCH_SIZE) {
    flushTimeout && clearTimeout(flushTimeout)
    flushLogs()
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushTimeout = null
      flushLogs()
    }, BATCH_DELAY_MS)
  }
}

function createLogMethod(level: LogLevel) {
  return (context: Record<string, unknown>, msg?: string) => {
    queueLog({
      level,
      ...context,
      msg,
      timestamp: new Date().toISOString(),
    })
  }
}

export const clientLog = {
  debug: createLogMethod('debug'),
  info: createLogMethod('info'),
  warn: createLogMethod('warn'),
  error: createLogMethod('error'),
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushLogs()
    }
  })
}
