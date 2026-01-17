/**
 * Unified UI Error Contract
 * 
 * The single source of truth for all error display in the UI.
 * All error sources (ApiResult, ZodError, Better Auth, Fetch, etc.)
 * are normalized into this format for consistent UI rendering.
 */

import { z } from "zod";

/**
 * Unified UI Error Schema
 * 
 * This is the ONLY error format the UI needs to handle.
 * All error sources are converted to this shape.
 */
export const uiErrorSchema = z.object({
  /** User-friendly error title */
  title: z.string(),
  /** User-friendly error message */
  message: z.string(),
  /** Optional error code for programmatic handling */
  code: z.string().optional(),
  /** Field-level errors (for form validation) */
  fieldErrors: z.record(z.string(), z.string()).optional(),
  /** Optional metadata for debugging (not shown to users) */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UiError = z.infer<typeof uiErrorSchema>;

/**
 * Type guard to check if value is UiError
 */
export function isUiError(value: unknown): value is UiError {
  return uiErrorSchema.safeParse(value).success;
}

/**
 * Default error titles by code
 */
export const ERROR_TITLES: Record<string, string> = {
  VALIDATION_ERROR: "Validation Error",
  NOT_FOUND: "Not Found",
  PERMISSION_DENIED: "Permission Denied",
  CONFLICT: "Conflict",
  INTERNAL: "Internal Error",
  UNAUTHORIZED: "Unauthorized",
  RATE_LIMIT_EXCEEDED: "Rate Limit Exceeded",
  BAD_REQUEST: "Bad Request",
  NETWORK_ERROR: "Network Error",
  UNKNOWN_ERROR: "Unknown Error",
};

/**
 * Default error messages by code
 */
export const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested resource was not found",
  PERMISSION_DENIED: "You don't have permission to perform this action",
  CONFLICT: "This action conflicts with existing data",
  INTERNAL: "An unexpected error occurred. Please try again",
  UNAUTHORIZED: "Please sign in to continue",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  BAD_REQUEST: "Invalid request. Please check your input",
  NETWORK_ERROR: "Network connection failed. Please check your internet connection",
  UNKNOWN_ERROR: "An unexpected error occurred",
};

/**
 * Create a UiError from basic properties
 */
export function createUiError(
  message: string,
  options?: {
    title?: string;
    code?: string;
    fieldErrors?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }
): UiError {
  const code = options?.code || "UNKNOWN_ERROR";
  return {
    title: options?.title || ERROR_TITLES[code] || ERROR_TITLES.UNKNOWN_ERROR,
    message,
    code,
    fieldErrors: options?.fieldErrors,
    metadata: options?.metadata,
  };
}
