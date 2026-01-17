/**
 * API Envelope Contracts
 * Standard response shapes for all API/action responses
 * 
 * All API responses follow this envelope pattern:
 * - Success: { ok: true, data: T }
 * - Error: { ok: false, error: { code, message, issues? } }
 * 
 * This ensures consistent error handling across the entire application.
 */

import { z } from "zod";
import type { $ZodType } from "zod/v4/core";

/**
 * API Issue Schema
 * Represents a single validation error for a specific field
 */
export const apiIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

export type ApiIssue = z.infer<typeof apiIssueSchema>;

/**
 * API Error Code Enum
 * Standard error codes used across the application
 */
export const apiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "PERMISSION_DENIED",
  "CONFLICT",
  "INTERNAL",
  "UNAUTHORIZED",
  "RATE_LIMIT_EXCEEDED",
  "BAD_REQUEST",
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

/**
 * API Error Schema
 * Standard error structure for all error responses
 */
export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  issues: z.array(apiIssueSchema).optional(),
  // Optional metadata for debugging (not shown to users)
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * API Success Schema
 * Generic success response with data
 */
export const apiOkSchema = <T extends $ZodType>(data: T) =>
  z.object({
    ok: z.literal(true),
    data,
    // Optional metadata (e.g., pagination, warnings)
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

/**
 * API Error Response Schema
 * Standard error response envelope
 */
export const apiErrSchema = z.object({
  ok: z.literal(false),
  error: apiErrorSchema,
});

/**
 * API Result Union Schema
 * Validates either success or error response
 * 
 * @example
 * ```ts
 * const result = apiResultSchema(taskSchema).safeParse(response);
 * if (result.success && result.data.ok) {
 *   // Handle success
 * } else if (result.success && !result.data.ok) {
 *   // Handle error
 * }
 * ```
 */
export const apiResultSchema = <T extends $ZodType>(data: T) =>
  z.union([apiOkSchema(data), apiErrSchema]);

// Type exports
export type ApiOk<T> = { ok: true; data: T; metadata?: Record<string, unknown> };
export type ApiErr = z.infer<typeof apiErrSchema>;
export type ApiResult<T> = ApiOk<T> | ApiErr;

/**
 * Type guard to check if result is success
 */
export function isApiOk<T>(result: ApiResult<T>): result is ApiOk<T> {
  return result.ok === true;
}

/**
 * Type guard to check if result is error
 */
export function isApiErr<T>(result: ApiResult<T>): result is ApiErr {
  return result.ok === false;
}

/**
 * Extract error from ApiResult
 * Returns undefined if result is success
 */
export function getApiError<T>(result: ApiResult<T>): ApiError | undefined {
  return isApiErr(result) ? result.error : undefined;
}

/**
 * Extract data from ApiResult
 * Returns undefined if result is error
 */
export function getApiData<T>(result: ApiResult<T>): T | undefined {
  return isApiOk(result) ? result.data : undefined;
}
