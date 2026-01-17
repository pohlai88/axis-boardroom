/**
 * Error Normalizer
 * 
 * Converts any error source into the unified UiError format.
 * This ensures the UI only needs to handle one error shape.
 */

import { z } from "zod/v4/mini";
import { ZodError } from "zod";
import type { ApiResult, ApiError, ApiIssue } from "@/lib/contracts";
import type { UiError } from "@/lib/contracts/errors/ui-error.contract";
import { createUiError, ERROR_TITLES, ERROR_MESSAGES } from "@/lib/contracts/errors/ui-error.contract";
import { formatZodPath } from "@/lib/shared/utils/zod-error-utils";

/**
 * Format API issue path to dot notation
 * Handles string/number paths correctly
 */
function formatApiIssuePath(path: (string | number)[]): string {
  const segs: string[] = [];
  
  for (const seg of path) {
    if (typeof seg === "number") {
      segs.push(`[${seg}]`);
    } else if (/[^\w$]/.test(seg)) {
      // Contains non-word characters - needs quoting
      segs.push(`[${JSON.stringify(seg)}]`);
    } else {
      if (segs.length) segs.push(".");
      segs.push(seg);
    }
  }
  
  return segs.join("");
}

/**
 * Normalize ApiResult error to UiError
 */
export function normalizeApiError<T>(result: ApiResult<T>): UiError | null {
  if (result.ok) {
    return null;
  }

  const error = result.error;
  const fieldErrors: Record<string, string> = {};

  // Convert validation issues to field errors
  // Use proper path formatting (handles numbers, symbols, nested paths)
  if (error.issues) {
    for (const issue of error.issues) {
      // Format path using dot notation (handles arrays, nested objects, special chars)
      const path = issue.path.length > 0 
        ? formatApiIssuePath(issue.path)
        : "root";
      
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      } else {
        // Multiple errors for same field - combine them
        fieldErrors[path] = `${fieldErrors[path]}, ${issue.message}`;
      }
    }
  }

  return createUiError(
    error.message || ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR,
    {
      title: ERROR_TITLES[error.code] || ERROR_TITLES.UNKNOWN_ERROR,
      code: error.code,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      metadata: error.metadata,
    }
  );
}

/**
 * Normalize ZodError to UiError
 * Uses Zod v4 core error structure and utilities
 */
export function normalizeZodError(error: ZodError): UiError {
  // Use flatten() for structured error extraction (Zod v4 utility)
  const flattened = error.flatten();
  
  // Extract field errors using proper path formatting
  const fieldErrors: Record<string, string> = {};
  
  if (flattened.fieldErrors && typeof flattened.fieldErrors === "object") {
    for (const [path, errors] of Object.entries(flattened.fieldErrors)) {
      if (Array.isArray(errors) && errors.length > 0) {
        // Use first error per field (most specific)
        const firstError = errors[0];
        fieldErrors[path] = typeof firstError === "string" 
          ? firstError 
          : firstError?.message || String(firstError);
      }
    }
  }

  // Determine primary message from form errors or field errors
  const primaryMessage = flattened.formErrors?.length 
    ? flattened.formErrors[0] 
    : Object.keys(fieldErrors).length > 0
      ? "Please check your input and try again"
      : "Validation failed";

  return createUiError(
    primaryMessage,
    {
      title: ERROR_TITLES.VALIDATION_ERROR,
      code: "VALIDATION_ERROR",
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      metadata: {
        formErrors: flattened.formErrors, // Global/form-level errors
        allFieldErrors: flattened.fieldErrors, // All errors (for debugging)
        issueCount: error.issues.length, // Total number of issues
      },
    }
  );
}

/**
 * Normalize Better Auth error to UiError
 * Better Auth errors typically have a message property
 */
export function normalizeAuthError(error: unknown): UiError {
  // Better Auth error structure (common patterns)
  if (error && typeof error === "object") {
    const authError = error as Record<string, unknown>;
    
    // Check for common Better Auth error properties
    if ("message" in authError && typeof authError.message === "string") {
      return createUiError(
        authError.message,
        {
          title: ERROR_TITLES.UNAUTHORIZED,
          code: "UNAUTHORIZED",
          metadata: authError,
        }
      );
    }
    
    // Check for error property
    if ("error" in authError && typeof authError.error === "string") {
      return createUiError(
        authError.error,
        {
          title: ERROR_TITLES.UNAUTHORIZED,
          code: "UNAUTHORIZED",
          metadata: authError,
        }
      );
    }
  }

  // Fallback for unknown auth errors
  return createUiError(
    "Authentication failed. Please try again.",
    {
      title: ERROR_TITLES.UNAUTHORIZED,
      code: "UNAUTHORIZED",
      metadata: { originalError: error },
    }
  );
}

/**
 * Normalize Fetch/Network error to UiError
 */
export function normalizeFetchError(error: unknown): UiError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return createUiError(
        ERROR_MESSAGES.NETWORK_ERROR,
        {
          title: ERROR_TITLES.NETWORK_ERROR,
          code: "NETWORK_ERROR",
          metadata: { originalError: error.message },
        }
      );
    }

    // HTTP errors
    if (error.message.includes("HTTP")) {
      const match = error.message.match(/HTTP (\d+):/);
      const status = match ? parseInt(match[1]) : 500;
      
      return createUiError(
        error.message,
        {
          title: status >= 500 ? ERROR_TITLES.INTERNAL : ERROR_TITLES.BAD_REQUEST,
          code: status >= 500 ? "INTERNAL" : "BAD_REQUEST",
          metadata: { status, originalError: error.message },
        }
      );
    }

    // Generic Error
    return createUiError(
      error.message,
      {
        title: ERROR_TITLES.UNKNOWN_ERROR,
        code: "UNKNOWN_ERROR",
        metadata: { originalError: error.message },
      }
    );
  }

  // Unknown error type
  return createUiError(
    ERROR_MESSAGES.UNKNOWN_ERROR,
    {
      title: ERROR_TITLES.UNKNOWN_ERROR,
      code: "UNKNOWN_ERROR",
      metadata: { originalError: String(error) },
    }
  );
}

/**
 * Normalize any error to UiError
 * This is the main entry point - handles all error types
 */
export function normalizeError(error: unknown): UiError {
  // ApiResult error
  if (error && typeof error === "object" && "ok" in error && "error" in error) {
    const apiResult = error as ApiResult<unknown>;
    const normalized = normalizeApiError(apiResult);
    if (normalized) {
      return normalized;
    }
  }

  // ZodError
  if (error instanceof ZodError) {
    return normalizeZodError(error);
  }

  // Better Auth error (check for common patterns)
  if (error && typeof error === "object" && ("message" in error || "error" in error)) {
    // Could be Better Auth error
    const normalized = normalizeAuthError(error);
    if (normalized.code === "UNAUTHORIZED") {
      return normalized;
    }
  }

  // Fetch/Network error
  if (error instanceof Error) {
    return normalizeFetchError(error);
  }

  // Unknown error - last resort
  return normalizeFetchError(error);
}

/**
 * Normalize error with context
 * Useful for adding additional context to errors
 */
export function normalizeErrorWithContext(
  error: unknown,
  context?: {
    operation?: string;
    resource?: string;
    metadata?: Record<string, unknown>;
  }
): UiError {
  const normalized = normalizeError(error);
  
  if (context) {
    return {
      ...normalized,
      message: context.operation 
        ? `${normalized.message} (${context.operation})`
        : normalized.message,
      metadata: {
        ...normalized.metadata,
        ...context.metadata,
        operation: context.operation,
        resource: context.resource,
      },
    };
  }

  return normalized;
}
