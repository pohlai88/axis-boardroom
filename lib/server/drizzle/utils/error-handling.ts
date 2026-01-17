/**
 * Drizzle Error Handling Utilities
 * 
 * Standardized error handling for database operations.
 * Provides user-friendly error messages and proper logging.
 */

import { createScopedLogger } from '@/lib/core/logger'
import { createErrorResult } from '@/lib/server/utils/api-result'

const logger = createScopedLogger('db.errors')

/**
 * Database Error Types
 */
export enum DbErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  UNIQUE_VIOLATION = 'UNIQUE_VIOLATION',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  CHECK_VIOLATION = 'CHECK_VIOLATION',
  NOT_NULL_VIOLATION = 'NOT_NULL_VIOLATION',
  INVALID_INPUT = 'INVALID_INPUT',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Parse database error and return user-friendly message
 */
export function parseDbError(error: unknown): {
  code: DbErrorCode
  message: string
  originalError: unknown
} {
  if (!(error instanceof Error)) {
    return {
      code: DbErrorCode.UNKNOWN,
      message: 'An unknown database error occurred',
      originalError: error,
    }
  }

  const errorMessage = error.message.toLowerCase()

  // PostgreSQL error codes
  if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
    return {
      code: DbErrorCode.UNIQUE_VIOLATION,
      message: 'A record with this value already exists',
      originalError: error,
    }
  }

  if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key constraint')) {
    return {
      code: DbErrorCode.FOREIGN_KEY_VIOLATION,
      message: 'Referenced record does not exist',
      originalError: error,
    }
  }

  if (errorMessage.includes('check constraint') || errorMessage.includes('violates check constraint')) {
    return {
      code: DbErrorCode.CHECK_VIOLATION,
      message: 'Data does not meet validation requirements',
      originalError: error,
    }
  }

  if (errorMessage.includes('not null') || errorMessage.includes('null value')) {
    return {
      code: DbErrorCode.NOT_NULL_VIOLATION,
      message: 'Required field is missing',
      originalError: error,
    }
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return {
      code: DbErrorCode.CONNECTION_ERROR,
      message: 'Database connection error. Please try again.',
      originalError: error,
    }
  }

  if (errorMessage.includes('invalid input') || errorMessage.includes('invalid value')) {
    return {
      code: DbErrorCode.INVALID_INPUT,
      message: 'Invalid input data provided',
      originalError: error,
    }
  }

  return {
    code: DbErrorCode.UNKNOWN,
    message: 'A database error occurred',
    originalError: error,
  }
}

/**
 * Handle database error and return ApiResult
 */
export function handleDbError(error: unknown, context?: string) {
  const parsed = parseDbError(error)

  logger.error(
    {
      event: 'db.error',
      code: parsed.code,
      context,
      error: parsed.originalError,
    },
    `Database error: ${parsed.message}`
  )

  return createErrorResult(
    parsed.code === DbErrorCode.NOT_FOUND ? 'NOT_FOUND' :
    parsed.code === DbErrorCode.UNIQUE_VIOLATION ? 'CONFLICT' :
    parsed.code === DbErrorCode.FOREIGN_KEY_VIOLATION ? 'BAD_REQUEST' :
    parsed.code === DbErrorCode.INVALID_INPUT ? 'VALIDATION_ERROR' :
    'INTERNAL',
    parsed.message
  )
}

/**
 * Wrap database operation with error handling
 * 
 * @example
 * ```ts
 * const result = await withDbErrorHandling(
 *   () => db.select().from(users),
 *   'fetching users'
 * )
 * ```
 */
export async function withDbErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const parsed = parseDbError(error)
    logger.error(
      {
        event: 'db.operation.error',
        code: parsed.code,
        context,
        error: parsed.originalError,
      },
      `Database operation failed: ${context || 'unknown'}`
    )
    throw error
  }
}
