/**
 * API Result Utilities
 * 
 * Server-side utilities for creating standardized ApiResult responses.
 * Ensures consistent error format across all server actions and route handlers.
 */

import type { ApiResult, ApiError, ApiIssue } from "@/lib/contracts";

/**
 * Create error result helper
 * Standardized way to create error responses
 * 
 * @example
 * ```ts
 * if (!task) {
 *   return createErrorResult("NOT_FOUND", "Task not found");
 * }
 * ```
 */
export function createErrorResult(
  code: ApiError["code"],
  message: string,
  issues?: ApiIssue[]
): ApiResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      issues,
    },
  };
}

/**
 * Create validation error result
 * Convenience helper for validation errors
 * 
 * @example
 * ```ts
 * const validation = schema.safeParse(input);
 * if (!validation.success) {
 *   return createValidationErrorResult(validation.error.issues);
 * }
 * ```
 */
export function createValidationErrorResult(
  issues: Array<{ path: (string | number)[]; message: string }>
): ApiResult<never> {
  return createErrorResult(
    "VALIDATION_ERROR",
    "Invalid input data",
    issues
  );
}

/**
 * Create success result helper
 * Standardized way to create success responses
 * 
 * @example
 * ```ts
 * const task = await createTask(data);
 * return createSuccessResult(task);
 * ```
 */
export function createSuccessResult<T>(data: T): ApiResult<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * Wrap async function with error handling
 * Automatically catches errors and converts to ApiResult
 * 
 * @example
 * ```ts
 * return wrapWithErrorHandling(async () => {
 *   const task = await createTask(data);
 *   return createSuccessResult(task);
 * });
 * ```
 */
export async function wrapWithErrorHandling<T>(
  fn: () => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return createErrorResult(
      "INTERNAL",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
