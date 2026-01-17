/**
 * Drizzle ORM Database Connection (Neon-Optimized)
 * 
 * Type-safe database access using Drizzle ORM with Neon DB.
 * 
 * Neon-Specific Optimizations:
 * - Uses `drizzle-orm/neon-http` for serverless-optimized HTTP connections
 * - Connection caching enabled (`fetchConnectionCache: true`) for better performance
 * - Lazy initialization to reduce cold start times in serverless environments
 * - Works with transactions (simple transactions supported via HTTP)
 * 
 * For complex/interactive transactions, consider migrating to `neon-websockets`:
 * ```ts
 * import { drizzle } from 'drizzle-orm/neon-websocket'
 * import { neonConfig, ws } from '@neondatabase/serverless'
 * neonConfig.webSocketConstructor = ws
 * ```
 * 
 * Reference: https://orm.drizzle.team/docs/get-started/neon-new
 * 
 * Best Practices:
 * - Always use transactions for multi-step operations
 * - Use prepared statements for frequently executed queries
 * - Validate input with Zod before database operations
 * - Handle errors gracefully with proper logging
 * 
 * Usage:
 * ```ts
 * import { db } from '@/lib/server/drizzle'
 * import { webVitals } from '@/lib/server/drizzle/schema'
 * import { eq, desc } from 'drizzle-orm'
 * 
 * // Simple query
 * const metrics = await db.select().from(webVitals)
 * 
 * // Filtered query
 * const recent = await db
 *   .select()
 *   .from(webVitals)
 *   .where(eq(webVitals.name, 'CLS'))
 *   .orderBy(desc(webVitals.timestamp))
 *   .limit(10)
 * 
 * // Transaction
 * await db.transaction(async (tx) => {
 *   await tx.insert(webVitals).values({ ... })
 *   await tx.insert(errors).values({ ... })
 * })
 * ```
 */

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import * as schema from './schema'
import * as multitenantSchema from './schema-multitenant'
import * as r2FilesSchema from './schema-r2-files'
import { env } from '@/lib/core/env'

// Conditional logger - works in both Next.js server context and standalone scripts
let logger: {
  debug: (obj: any, msg: string) => void
  info: (obj: any, msg: string) => void
  error: (obj: any, msg: string) => void
}

try {
  // Try to use Next.js logger (server-only)
  const { createScopedLogger } = require('@/lib/core/logger')
  logger = createScopedLogger('db')
} catch {
  // Fallback to console logger for standalone scripts
  logger = {
    debug: (obj: any, msg: string) => {
      if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined') {
        console.debug(`[DB] ${msg}`, obj)
      }
    },
    info: (obj: any, msg: string) => {
      if (typeof console !== 'undefined') {
        console.info(`[DB] ${msg}`, obj)
      }
    },
    error: (obj: any, msg: string) => {
      if (typeof console !== 'undefined') {
        console.error(`[DB] ${msg}`, obj)
      }
    },
  }
}

// Combine all schemas for Drizzle
const allSchemas = {
  ...schema,
  ...multitenantSchema,
  ...r2FilesSchema,
}

// Database instance (initialized lazily)
let dbInstance: ReturnType<typeof drizzle> | null = null

/**
 * Get database instance
 * Initializes connection on first access
 * 
 * @throws {Error} If DATABASE_URL is not provided
 */
function getDb(): ReturnType<typeof drizzle> {
  // Use process.env directly to avoid issues with env.ts parsing before dotenv loads
  const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required but not provided')
  }

  if (!dbInstance) {
    try {
      // Neon serverless connection with optimized caching
      // This optimizes for serverless environments by reusing connections
      // Reference: https://neon.tech/docs/serverless/serverless-driver
      const sql = neon(databaseUrl, {
        // Enable connection caching for better performance in serverless
        // Reuses connections across invocations when possible
        // This eliminates connection pool exhaustion in serverless environments
        fetchConnectionCache: true,
        // Use fetch API for better edge compatibility
        // Automatically handles connection pooling and retries
        fetchOptions: {
          // Cache control for connection reuse
          cache: 'default',
        },
      })
      
      dbInstance = drizzle(sql, {
        schema: allSchemas,
        // Log queries in development
        logger: process.env.NODE_ENV === 'development' ? {
          logQuery: (query, params) => {
            logger.debug(
              { 
                event: 'db.query',
                query: query.replace(/\s+/g, ' ').trim(),
                params: params?.length || 0,
              },
              'Database query executed'
            )
          },
        } : false,
      })
      
      logger.info({ event: 'db.init' }, 'Database connection initialized')
    } catch (error) {
      logger.error(
        { event: 'db.init.fail', error },
        'Failed to initialize database connection'
      )
      throw error
    }
  }

  return dbInstance
}

/**
 * Database instance
 * Use this for all database operations
 * 
 * Lazily initialized - only creates connection when first accessed
 * 
 * @example
 * ```ts
 * import { db } from '@/lib/server/drizzle'
 * const users = await db.select().from(users)
 * ```
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const instance = getDb()
    const value = (instance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})

/**
 * Check if database is available
 */
export function isDbAvailable(): boolean {
  return (process.env.DATABASE_URL !== undefined || env.DATABASE_URL !== undefined) && dbInstance !== null
}

/**
 * Health check for database connection
 */
export async function checkDbHealth(): Promise<{ healthy: boolean; error?: string }> {
  if (!isDbAvailable()) {
    return { healthy: false, error: 'Database not initialized' }
  }

  try {
    await db.execute(sql`SELECT 1`)
    return { healthy: true }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Export schemas
export * from './schema'
export * from './schema-multitenant'
export * from './schema-r2-files'