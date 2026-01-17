/**
 * Redis Cache Layer
 * 
 * Optional Redis caching for improved performance.
 * Falls back to no-op if REDIS_URL is not provided.
 */

import Redis from 'ioredis'
import { env } from '@/lib/core/env'
import { createScopedLogger, withLog } from '@/lib/core/logger'

const log = createScopedLogger('cache', { provider: 'redis' })

// Initialize Redis connection (optional)
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })
  : null

if (redis) {
  redis.on('connect', () => {
    log.info({ event: 'cache.connect.ok' }, 'Redis connection established')
  })
  
  redis.on('error', (error) => {
    log.error({ event: 'cache.connect.fail', err: error }, 'Redis connection error')
  })
} else {
  log.warn({ event: 'cache.disabled' }, 'REDIS_URL not provided, Redis caching disabled')
}

/**
 * Get cached value or fetch and cache
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300 // 5 minutes default
): Promise<T> {
  if (!redis) return fetcher()
  
  return withLog(log, 'cache.get', { key, ttl }, async () => {
    const cached = await redis.get(key)
    if (cached) {
      log.debug({ event: 'cache.get.hit', key }, 'Cache hit')
      return JSON.parse(cached) as T
    }
    
    log.debug({ event: 'cache.get.miss', key }, 'Cache miss')
    const data = await fetcher()
    await redis.setex(key, ttl, JSON.stringify(data))
    return data
  }).catch((error) => {
    log.error({ event: 'cache.get.error', key, err: error }, 'Cache error, falling back to fetcher')
    return fetcher()
  })
}

/**
 * Invalidate cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return
  
  return withLog(log, 'cache.invalidate', { key }, async () => {
    await redis.del(key)
  }).catch((error) => {
    log.error({ event: 'cache.invalidate.error', key, err: error }, 'Cache invalidation failed')
  })
}

/**
 * Clear all cache (use with caution)
 */
export async function clearCache(): Promise<void> {
  if (!redis) return
  
  return withLog(log, 'cache.clear', {}, async () => {
    await redis.flushdb()
    log.warn({ event: 'cache.clear.ok' }, 'All cache cleared - use with caution')
  }).catch((error) => {
    log.error({ event: 'cache.clear.error', err: error }, 'Cache clear failed')
  })
}
