/**
 * Read Replica Support for Drizzle
 * 
 * Uses official Drizzle `withReplicas()` function for read replica support.
 * 
 * Reference: https://orm.drizzle.team/docs/read-replicas
 * 
 * Neon supports read replicas - configure them in Neon Console and
 * provide DATABASE_REPLICA_URL environment variable.
 * 
 * Usage:
 * ```ts
 * import { db } from '@/lib/server/drizzle/read-replica'
 * import { users } from '@/lib/server/drizzle/schema'
 * 
 * // Read from replica (automatic)
 * const users = await db.select().from(users)
 * 
 * // Write to primary (automatic)
 * await db.insert(users).values({ name: 'New User' })
 * 
 * // Force read from primary
 * const users = await db.$primary.select().from(users)
 * ```
 */

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { withReplicas } from 'drizzle-orm'
import { env } from '@/lib/core/env'
import { createScopedLogger } from '@/lib/core/logger'
import * as schema from './schema'
import * as multitenantSchema from './schema-multitenant'

const logger = createScopedLogger('db.replica')

// Combine all schemas
const allSchemas = {
  ...schema,
  ...multitenantSchema,
}

// Database instance with read replicas
let dbInstance: ReturnType<typeof withReplicas> | null = null

/**
 * Get database instance with read replicas
 * Uses official Drizzle `withReplicas()` function
 * 
 * @see https://orm.drizzle.team/docs/read-replicas
 */
function getDb(): ReturnType<typeof withReplicas> {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required but not provided')
  }

  if (!dbInstance) {
    try {
      // Primary database (for writes)
      // Optimized for serverless with connection caching
      const primarySql = neon(env.DATABASE_URL, {
        fetchConnectionCache: true,
        fetchOptions: {
          cache: 'default',
        },
      })
      
      const primaryDb = drizzle(primarySql, {
        schema: allSchemas,
        logger: process.env.NODE_ENV === 'development' ? {
          logQuery: (query, params) => {
            logger.debug(
              { 
                event: 'db.query.primary',
                query: query.replace(/\s+/g, ' ').trim(),
                params: params?.length || 0,
              },
              'Primary database query executed'
            )
          },
        } : false,
      })

      // Read replicas (for reads)
      const replicas: ReturnType<typeof drizzle>[] = []
      
      if (env.DATABASE_REPLICA_URL) {
        // Read replica connection (optimized for reads)
        const replicaSql = neon(env.DATABASE_REPLICA_URL, {
          fetchConnectionCache: true,
          fetchOptions: {
            cache: 'default',
          },
        })
        
        const replicaDb = drizzle(replicaSql, {
          schema: allSchemas,
          logger: process.env.NODE_ENV === 'development' ? {
            logQuery: (query, params) => {
              logger.debug(
                { 
                  event: 'db.query.replica',
                  query: query.replace(/\s+/g, ' ').trim(),
                  params: params?.length || 0,
                },
                'Read replica query executed'
              )
            },
          } : false,
        })
        
        replicas.push(replicaDb)
        logger.info({ event: 'db.replica.init' }, 'Read replica connection initialized')
      }

      // Use withReplicas() to combine primary and replicas
      // Drizzle automatically routes SELECT to replicas, writes to primary
      dbInstance = withReplicas(primaryDb, replicas)
      
      logger.info(
        { 
          event: 'db.init',
          hasReplicas: replicas.length > 0,
          replicaCount: replicas.length 
        },
        'Database with read replicas initialized'
      )
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
 * Database instance with read replica support
 * 
 * Drizzle automatically routes:
 * - SELECT queries → read replicas (if available)
 * - INSERT/UPDATE/DELETE → primary database
 * 
 * Use `db.$primary` to force read from primary
 * 
 * @example
 * ```ts
 * import { db } from '@/lib/server/drizzle/read-replica'
 * 
 * // Read from replica (automatic)
 * const users = await db.select().from(users)
 * 
 * // Write to primary (automatic)
 * await db.insert(users).values({ name: 'New User' })
 * 
 * // Force read from primary
 * const users = await db.$primary.select().from(users)
 * ```
 */
export const db = getDb()

/**
 * Check if read replica is configured
 */
export function isReadReplicaConfigured(): boolean {
  return !!env.DATABASE_REPLICA_URL
}
