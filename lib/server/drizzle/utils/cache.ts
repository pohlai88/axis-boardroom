/**
 * Drizzle Query Caching with Redis
 * 
 * Cache query results to reduce database load.
 * Integrates with existing Redis cache utilities.
 */

import { db } from '../index'
import { getCached, invalidateCache as redisInvalidateCache } from '@/lib/server/cache/redis'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('db.cache')

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number // Time to live in seconds (default: 300)
  key?: string // Custom cache key
  tags?: string[] // Cache tags for invalidation
}

/**
 * Generate cache key from query function
 */
function generateCacheKey(queryFn: () => unknown, customKey?: string): string {
  if (customKey) {
    return `drizzle:query:${customKey}`
  }
  
  // Generate key from function string representation
  const fnString = queryFn.toString()
  const hash = Buffer.from(fnString).toString('base64').slice(0, 32)
  return `drizzle:query:${hash}`
}

/**
 * Execute query with caching
 * 
 * Uses existing Redis cache utilities from lib/server/cache/redis.ts
 * 
 * @example
 * ```ts
 * const users = await cachedQuery(
 *   () => db.select().from(users),
 *   { ttl: 300, key: 'users:all', tags: ['users'] }
 * )
 * ```
 */
export async function cachedQuery<T>(
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 300, key, tags = [] } = options
  const cacheKey = generateCacheKey(queryFn, key)

  try {
    // Use existing getCached utility
    return await getCached(
      cacheKey,
      async () => {
        logger.debug({ cacheKey }, 'Cache miss, executing query')
        return await queryFn()
      },
      ttl
    )
  } catch (error) {
    logger.error(
      { event: 'cache.query.error', error, cacheKey },
      'Cache operation failed, executing query directly'
    )
    // Fallback to direct query
    return await queryFn()
  }
}

/**
 * Invalidate cache by key
 * 
 * @example
 * ```ts
 * await invalidateCache('users:all')
 * ```
 */
export async function invalidateCache(key: string): Promise<void> {
  const cacheKey = key.startsWith('drizzle:query:') ? key : `drizzle:query:${key}`
  
  try {
    await redisInvalidateCache(cacheKey)
    logger.debug({ key: cacheKey }, 'Cache invalidated')
  } catch (error) {
    logger.error(
      { event: 'cache.invalidate.error', error, key: cacheKey },
      'Cache invalidation failed'
    )
  }
}

/**
 * Invalidate cache by tag
 * 
 * Note: This requires storing tag-to-key mappings in Redis.
 * For now, use specific keys or implement tag storage.
 * 
 * @example
 * ```ts
 * await invalidateCacheByTag('users')
 * ```
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  // TODO: Implement tag-based invalidation
  // This would require storing tag->key mappings in Redis
  logger.warn(
    { tag },
    'Tag-based cache invalidation not yet implemented. Use specific keys instead.'
  )
}

/**
 * Clear all Drizzle-related cache
 * 
 * @example
 * ```ts
 * await clearDrizzleCache()
 * ```
 */
export async function clearDrizzleCache(): Promise<void> {
  // Note: This would require Redis SCAN to find all drizzle:query:* keys
  // For now, invalidate specific keys manually
  logger.warn('Bulk cache clearing not yet implemented. Invalidate specific keys instead.')
}
