/**
 * Simple Neon Database Connection Module
 * 
 * This is a simple example module for direct SQL queries with Neon.
 * 
 * Note: Your project already has a more sophisticated setup using Drizzle ORM
 * at `lib/server/drizzle/index.ts`. This module is provided as a simple
 * example for raw SQL queries.
 * 
 * For production use, consider using the Drizzle ORM setup instead:
 * ```ts
 * import { db } from '@/lib/server/drizzle'
 * ```
 * 
 * Official Neon Documentation:
 * - Connection Guide: https://neon.com/docs/connect/connect-intro
 * - Serverless Driver: https://neon.com/docs/serverless/serverless-driver
 * - Connection Pooling: https://neon.com/docs/connect/connection-pooling
 * 
 * Usage:
 * ```ts
 * import { sql } from '@/app/lib/db'
 * const result = await sql`SELECT version()`
 * ```
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

/**
 * Neon serverless SQL client
 * 
 * Optimized for serverless and edge functions with HTTP connections.
 * Uses connection caching to improve performance in serverless environments.
 * 
 * Features:
 * - HTTP-based connections (no WebSocket overhead)
 * - Connection caching enabled for better performance
 * - Secure by default (requires SSL)
 * 
 * For connection pooling (high-traffic apps), use the pooled connection string
 * from Neon Console and enable pooling in your connection string.
 * 
 * Reference: https://neon.com/docs/serverless/serverless-driver
 */
export const sql = neon(process.env.DATABASE_URL, {
  // Enable connection caching for better performance in serverless
  // Reuses connections across invocations when possible
  // Reference: https://neon.com/docs/serverless/serverless-driver#connection-caching
  fetchConnectionCache: true,
})
