/**
 * Base Repository Pattern
 * 
 * Provides common CRUD operations following Drizzle best practices.
 * Extend this class for entity-specific repositories.
 * 
 * @example
 * ```ts
 * class TaskRepository extends BaseRepository<typeof tasks> {
 *   async findByStatus(status: string) {
 *     return this.findAll(eq(this.table.status, status))
 *   }
 * }
 * ```
 */

import type { PgTable } from 'drizzle-orm/pg-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { eq, SQL } from 'drizzle-orm'
import { db } from '../index'
import {
  findById,
  findAll,
  findPaginated,
  create,
  createMany,
  updateById,
  deleteById,
  existsById,
  count,
  type PaginationOptions,
  type PaginatedResult,
} from '../utils/query-helpers'
import { withDbErrorHandling } from '../utils/error-handling'

/**
 * Base Repository Class
 */
export abstract class BaseRepository<T extends PgTable> {
  constructor(protected table: T) {}

  /**
   * Find by ID
   */
  async findById(id: string | number, idColumn: string = 'id'): Promise<InferSelectModel<T> | null> {
    return withDbErrorHandling(
      () => findById(this.table, id, idColumn),
      `${this.getTableName()}.findById`
    )
  }

  /**
   * Find all with optional filtering
   */
  async findAll(where?: SQL): Promise<InferSelectModel<T>[]> {
    return withDbErrorHandling(
      () => findAll(this.table, where),
      `${this.getTableName()}.findAll`
    )
  }

  /**
   * Find paginated
   */
  async findPaginated(
    pagination: PaginationOptions,
    where?: SQL
  ): Promise<PaginatedResult<InferSelectModel<T>>> {
    return withDbErrorHandling(
      () => findPaginated(this.table, pagination, where),
      `${this.getTableName()}.findPaginated`
    )
  }

  /**
   * Create single record
   */
  async create(data: InferInsertModel<T>): Promise<InferSelectModel<T>> {
    return withDbErrorHandling(
      () => create(this.table, data),
      `${this.getTableName()}.create`
    )
  }

  /**
   * Create multiple records
   */
  async createMany(data: InferInsertModel<T>[]): Promise<InferSelectModel<T>[]> {
    return withDbErrorHandling(
      () => createMany(this.table, data),
      `${this.getTableName()}.createMany`
    )
  }

  /**
   * Update by ID
   */
  async updateById(
    id: string | number,
    data: Partial<InferInsertModel<T>>,
    idColumn: string = 'id'
  ): Promise<InferSelectModel<T> | null> {
    return withDbErrorHandling(
      () => updateById(this.table, id, data, idColumn),
      `${this.getTableName()}.updateById`
    )
  }

  /**
   * Delete by ID
   */
  async deleteById(id: string | number, idColumn: string = 'id'): Promise<boolean> {
    return withDbErrorHandling(
      () => deleteById(this.table, id, idColumn),
      `${this.getTableName()}.deleteById`
    )
  }

  /**
   * Check if exists
   */
  async exists(id: string | number, idColumn: string = 'id'): Promise<boolean> {
    return withDbErrorHandling(
      () => existsById(this.table, id, idColumn),
      `${this.getTableName()}.exists`
    )
  }

  /**
   * Count records
   */
  async count(where?: SQL): Promise<number> {
    return withDbErrorHandling(
      () => count(this.table, where),
      `${this.getTableName()}.count`
    )
  }

  /**
   * Get table name for logging
   */
  protected getTableName(): string {
    // Try to get table name from Drizzle's internal structure
    const tableName = (this.table as any)[Symbol.for('drizzle:Name')] || 
                     (this.table as any).name || 
                     'unknown'
    return String(tableName)
  }
}
