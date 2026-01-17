/**
 * Drizzle Query Helpers
 * 
 * Reusable query patterns and utilities following Drizzle best practices.
 * These helpers reduce boilerplate and ensure consistent query patterns.
 */

import { db } from '../index'
import { eq, and, or, desc, asc, sql, like, ilike, inArray, not, isNull, isNotNull, type SQL } from 'drizzle-orm'
import { createScopedLogger } from '@/lib/core/logger'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

const logger = createScopedLogger('db.queries')

/**
 * Query Options
 */
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: 'asc' | 'desc'
  orderByColumn?: string
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number
  limit: number
}

/**
 * Pagination Result
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Find single record by ID
 * 
 * @example
 * ```ts
 * const task = await findById(tasks, 'task-123')
 * ```
 */
export async function findById<T extends PgTable>(
  table: T,
  id: string | number,
  idColumn: string = 'id'
): Promise<InferSelectModel<T> | null> {
  try {
    const idCol = table[idColumn as keyof T]
    if (!idCol) {
      throw new Error(`Column "${idColumn}" not found in table`)
    }
    
    const result = await db
      .select()
      .from(table)
      .where(eq(idCol as any, id))
      .limit(1)

    return (result[0] as InferSelectModel<T>) || null
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.findById.error', table: tableName, id, error },
      'Failed to find record by ID'
    )
    throw error
  }
}

/**
 * Find multiple records by IDs
 * 
 * @example
 * ```ts
 * const tasks = await findByIds(tasks, ['task-1', 'task-2'])
 * ```
 */
export async function findByIds<T extends PgTable>(
  table: T,
  ids: (string | number)[],
  idColumn: string = 'id'
): Promise<InferSelectModel<T>[]> {
  if (ids.length === 0) return []

  try {
    const idCol = table[idColumn as keyof T]
    if (!idCol) {
      throw new Error(`Column "${idColumn}" not found in table`)
    }
    
    return await db
      .select()
      .from(table)
      .where(inArray(idCol as any, ids))
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.findByIds.error', table: tableName, ids, error },
      'Failed to find records by IDs'
    )
    throw error
  }
}

/**
 * Find all records with optional filtering
 * 
 * @example
 * ```ts
 * const allTasks = await findAll(tasks)
 * const activeTasks = await findAll(tasks, { status: 'active' })
 * ```
 */
export async function findAll<T extends PgTable>(
  table: T,
  where?: SQL,
  options?: QueryOptions
): Promise<InferSelectModel<T>[]> {
  try {
    let query = db.select().from(table)

    if (where) {
      query = query.where(where)
    }

    if (options?.orderByColumn) {
      const orderFn = options.orderBy === 'desc' ? desc : asc
      const orderCol = table[options.orderByColumn as keyof T] as any
      query = query.orderBy(orderFn(orderCol))
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.offset(options.offset)
    }

    return await query
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.findAll.error', table: tableName, error },
      'Failed to find all records'
    )
    throw error
  }
}

/**
 * Paginated query
 * 
 * @example
 * ```ts
 * const result = await findPaginated(tasks, { page: 1, limit: 10 })
 * ```
 */
export async function findPaginated<T extends PgTable>(
  table: T,
  pagination: PaginationOptions,
  where?: SQL,
  orderBy?: SQL
): Promise<PaginatedResult<InferSelectModel<T>>> {
  try {
    const offset = (pagination.page - 1) * pagination.limit

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(table)
      .where(where || sql`1=1`)

    const total = Number(countResult[0]?.count || 0)

    // Get paginated data
    let query = db
      .select()
      .from(table)
      .where(where || sql`1=1`)
      .limit(pagination.limit)
      .offset(offset)

    if (orderBy) {
      query = query.orderBy(orderBy)
    }

    const data = await query

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasMore: offset + pagination.limit < total,
      },
    }
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.findPaginated.error', table: tableName, pagination, error },
      'Failed to execute paginated query'
    )
    throw error
  }
}

/**
 * Create single record
 * 
 * @example
 * ```ts
 * const newTask = await create(tasks, { title: 'New Task', status: 'todo' })
 * ```
 */
export async function create<T extends PgTable>(
  table: T,
  data: InferInsertModel<T>
): Promise<InferSelectModel<T>> {
  try {
    const result = await db
      .insert(table)
      .values(data as any)
      .returning()

    if (!result[0]) {
      throw new Error('Failed to create record - no data returned')
    }

    const tableName = getTableName(table)
    logger.debug(
      { event: 'db.create', table: tableName, id: (result[0] as any).id },
      'Record created'
    )

    return result[0] as InferSelectModel<T>
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.create.error', table: tableName, data, error },
      'Failed to create record'
    )
    throw error
  }
}

/**
 * Create multiple records
 * 
 * @example
 * ```ts
 * const newTasks = await createMany(tasks, [
 *   { title: 'Task 1' },
 *   { title: 'Task 2' },
 * ])
 * ```
 */
export async function createMany<T extends PgTable>(
  table: T,
  data: InferInsertModel<T>[]
): Promise<InferSelectModel<T>[]> {
  if (data.length === 0) return []

  try {
    const result = await db
      .insert(table)
      .values(data as any)
      .returning()

    const tableName = getTableName(table)
    logger.debug(
      { event: 'db.createMany', table: tableName, count: result.length },
      'Records created'
    )

    return result as InferSelectModel<T>[]
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.createMany.error', table: tableName, count: data.length, error },
      'Failed to create records'
    )
    throw error
  }
}

/**
 * Update record by ID
 * 
 * @example
 * ```ts
 * const updated = await updateById(tasks, 'task-123', { status: 'done' })
 * ```
 */
export async function updateById<T extends PgTable>(
  table: T,
  id: string | number,
  data: Partial<InferInsertModel<T>>,
  idColumn: string = 'id'
): Promise<InferSelectModel<T> | null> {
  try {
    const idCol = table[idColumn as keyof T] as any
    const result = await db
      .update(table)
      .set(data as any)
      .where(eq(idCol, id))
      .returning()

    if (!result[0]) {
      return null
    }

    const tableName = getTableName(table)
    logger.debug(
      { event: 'db.updateById', table: tableName, id },
      'Record updated'
    )

    return result[0] as InferSelectModel<T>
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.updateById.error', table: tableName, id, error },
      'Failed to update record'
    )
    throw error
  }
}

/**
 * Delete record by ID
 * 
 * @example
 * ```ts
 * const deleted = await deleteById(tasks, 'task-123')
 * ```
 */
export async function deleteById<T extends PgTable>(
  table: T,
  id: string | number,
  idColumn: string = 'id'
): Promise<boolean> {
  try {
    const idCol = table[idColumn as keyof T] as any
    const result = await db
      .delete(table)
      .where(eq(idCol, id))
      .returning()

    const deleted = result.length > 0

    if (deleted) {
      const tableName = getTableName(table)
      logger.debug(
        { event: 'db.deleteById', table: tableName, id },
        'Record deleted'
      )
    }

    return deleted
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.deleteById.error', table: tableName, id, error },
      'Failed to delete record'
    )
    throw error
  }
}

/**
 * Check if record exists
 * 
 * @example
 * ```ts
 * const exists = await existsById(tasks, 'task-123')
 * ```
 */
export async function existsById<T extends PgTable>(
  table: T,
  id: string | number,
  idColumn: string = 'id'
): Promise<boolean> {
  try {
    const idCol = table[idColumn as keyof T] as any
    const result = await db
      .select({ id: idCol })
      .from(table)
      .where(eq(idCol, id))
      .limit(1)

    return result.length > 0
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.existsById.error', table: tableName, id, error },
      'Failed to check record existence'
    )
    return false
  }
}

/**
 * Count records with optional where clause
 * 
 * @example
 * ```ts
 * const count = await count(tasks)
 * const activeCount = await count(tasks, eq(tasks.status, 'active'))
 * ```
 */
export async function count<T extends PgTable>(
  table: T,
  where?: SQL
): Promise<number> {
  try {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(table)

    if (where) {
      query = query.where(where) as typeof query
    }

    const result = await query
    return Number(result[0]?.count || 0)
  } catch (error) {
    const tableName = getTableName(table)
    logger.error(
      { event: 'db.count.error', table: tableName, error },
      'Failed to count records'
    )
    throw error
  }
}

/**
 * Get table name for logging
 * Helper function to extract table name from Drizzle table object
 */
function getTableName(table: PgTable): string {
  // Try to get table name from Drizzle's internal structure
  const tableName = (table as any)[Symbol.for('drizzle:Name')] || 
                   (table as any).name || 
                   (table as any)._[Symbol.for('drizzle:Name')] ||
                   'unknown'
  return String(tableName)
}

// Re-export commonly used Drizzle functions
export { eq, and, or, desc, asc, sql, like, ilike, inArray, not, isNull, isNotNull }
