/**
 * Drizzle Transaction Utilities
 * 
 * Transaction helpers following Drizzle best practices.
 * Ensures atomic operations and proper error handling.
 */

import { db } from '../index'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('db.transactions')

/**
 * Transaction Options
 */
export interface TransactionOptions {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable'
  timeout?: number
}

/**
 * Execute operation in transaction with automatic rollback on error
 * 
 * @example
 * ```ts
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.insert(users).values({ name: 'John' }).returning()
 *   await tx.insert(profiles).values({ userId: user[0].id })
 *   return user[0]
 * })
 * ```
 */
export async function withTransaction<T>(
  callback: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  try {
    return await db.transaction(
      async (tx) => {
        try {
          return await callback(tx)
        } catch (error) {
          logger.error(
            { event: 'db.transaction.error', error },
            'Transaction callback failed, rolling back'
          )
          throw error
        }
      },
      {
        isolationLevel: options?.isolationLevel,
      }
    )
  } catch (error) {
    logger.error(
      { event: 'db.transaction.fail', error },
      'Transaction failed'
    )
    throw error
  }
}

/**
 * Retry transaction on conflict
 * Useful for optimistic locking scenarios
 * 
 * @example
 * ```ts
 * const result = await retryTransaction(
 *   async (tx) => {
 *     // Your transaction logic
 *   },
 *   { maxRetries: 3 }
 * )
 * ```
 */
export async function retryTransaction<T>(
  callback: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
  options: { maxRetries?: number; retryDelay?: number } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const retryDelay = options.retryDelay ?? 100

  let lastError: Error | unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback)
    } catch (error) {
      lastError = error

      // Check if it's a retryable error (e.g., serialization failure)
      const isRetryable = error instanceof Error && (
        error.message.includes('serialization') ||
        error.message.includes('deadlock') ||
        error.message.includes('could not serialize')
      )

      if (!isRetryable || attempt === maxRetries) {
        throw error
      }

      logger.warn(
        { event: 'db.transaction.retry', attempt, maxRetries, error },
        `Retrying transaction (attempt ${attempt}/${maxRetries})`
      )

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }

  throw lastError
}

/**
 * Batch operations in transaction
 * Useful for bulk inserts/updates
 * 
 * @example
 * ```ts
 * await batchInTransaction([
 *   () => db.insert(users).values({ name: 'John' }),
 *   () => db.insert(users).values({ name: 'Jane' }),
 * ])
 * ```
 */
export async function batchInTransaction<T>(
  operations: Array<(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>>
): Promise<T[]> {
  return await withTransaction(async (tx) => {
    const results: T[] = []
    
    for (const operation of operations) {
      const result = await operation(tx)
      results.push(result)
    }
    
    return results
  })
}
