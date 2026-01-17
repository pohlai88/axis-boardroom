/**
 * Dynamic Query Building Utilities
 * 
 * Build queries dynamically using Drizzle's `.$dynamic()` method.
 * 
 * Reference: https://orm.drizzle.team/docs/dynamic-query-building
 * 
 * The `.$dynamic()` method enables multiple method calls on query builders,
 * allowing you to build queries conditionally or in shared functions.
 */

import { db } from '../index'
import { eq, and, or, desc, asc, gt, gte, lt, lte, type SQL, type PgSelect } from 'drizzle-orm'
import { createScopedLogger } from '@/lib/core/logger'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { InferSelectModel } from 'drizzle-orm'

const logger = createScopedLogger('db.dynamic-query')

/**
 * Get table name for logging
 */
function getTableName(table: PgTable): string {
  const tableName = (table as any)[Symbol.for('drizzle:Name')] || 
                   (table as any).name || 
                   (table as any)._[Symbol.for('drizzle:Name')] ||
                   'unknown'
  return String(tableName)
}

/**
 * Add pagination to a query
 * 
 * Uses `.$dynamic()` to allow multiple method calls
 * 
 * @example
 * ```ts
 * let query = db.select().from(users).where(eq(users.status, 'active')).$dynamic()
 * query = withPagination(query, 1, 10)
 * const users = await query
 * ```
 */
export function withPagination<T extends PgSelect>(
  qb: T,
  page: number = 1,
  pageSize: number = 10
): T {
  return qb.limit(pageSize).offset((page - 1) * pageSize) as T
}

/**
 * Add conditional where clause
 * 
 * @example
 * ```ts
 * let query = db.select().from(users).$dynamic()
 * if (status) {
 *   query = withWhere(query, eq(users.status, status))
 * }
 * if (role) {
 *   query = withWhere(query, eq(users.role, role))
 * }
 * const users = await query
 * ```
 */
export function withWhere<T extends PgSelect>(
  qb: T,
  condition: SQL
): T {
  // If query already has a where clause, combine with AND
  // Note: This is a simplified version - Drizzle handles this automatically in dynamic mode
  return qb.where(condition) as T
}

/**
 * Add conditional ordering
 * 
 * @example
 * ```ts
 * let query = db.select().from(users).$dynamic()
 * query = withOrderBy(query, desc(users.createdAt))
 * const users = await query
 * ```
 */
export function withOrderBy<T extends PgSelect>(
  qb: T,
  orderBy: SQL
): T {
  return qb.orderBy(orderBy) as T
}

/**
 * Build dynamic query with filters
 * 
 * @example
 * ```ts
 * const users = await buildDynamicQuery(usersTable, {
 *   filters: [
 *     { field: 'status', operator: 'eq', value: 'active' },
 *     { field: 'age', operator: 'gte', value: 18 }
 *   ],
 *   sort: [{ field: 'created_at', direction: 'desc' }],
 *   limit: 10
 * })
 * ```
 */
export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  value: unknown
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

export interface DynamicQueryOptions {
  filters?: FilterCondition[]
  sort?: SortOption[]
  limit?: number
  offset?: number
}

export async function buildDynamicQuery<T extends PgTable>(
  table: T,
  options: DynamicQueryOptions = {}
): Promise<InferSelectModel<T>[]> {
  const { filters = [], sort = [], limit, offset } = options

  // Start with dynamic query builder
  let query = db.select().from(table).$dynamic()

  // Apply filters
  if (filters.length > 0) {
    const conditions: SQL[] = []
    
    for (const filter of filters) {
      const column = table[filter.field as keyof T]
      if (!column) {
        const tableName = getTableName(table)
        logger.warn({ field: filter.field, table: tableName }, 'Column not found in table')
        continue
      }

      switch (filter.operator) {
        case 'eq':
          conditions.push(eq(column as any, filter.value))
          break
        case 'gt':
          conditions.push(gt(column as any, filter.value as number))
          break
        case 'gte':
          conditions.push(gte(column as any, filter.value as number))
          break
        case 'lt':
          conditions.push(lt(column as any, filter.value as number))
          break
        case 'lte':
          conditions.push(lte(column as any, filter.value as number))
          break
        // Add more operators as needed
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }
  }

  // Apply sorting
  if (sort.length > 0) {
    for (const sortOption of sort) {
      const column = table[sortOption.field as keyof T]
      if (!column) {
        const tableName = getTableName(table)
        logger.warn({ field: sortOption.field, table: tableName }, 'Column not found for sorting')
        continue
      }
      
      const orderFn = sortOption.direction === 'desc' ? desc : asc
      query = query.orderBy(orderFn(column as any))
    }
  }

  // Apply pagination
  if (limit) {
    query = query.limit(limit)
  }
  if (offset) {
    query = query.offset(offset)
  }

  return await query
}

/**
 * Example: Shared query enhancement function
 * 
 * @example
 * ```ts
 * function withFriends<T extends PgSelect>(qb: T) {
 *   return qb.leftJoin(friends, eq(friends.userId, users.id))
 * }
 * 
 * let query = db.select().from(users).where(eq(users.id, 1)).$dynamic()
 * query = withFriends(query)
 * const usersWithFriends = await query
 * ```
 */
