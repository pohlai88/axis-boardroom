/**
 * Error Handler Utilities
 * 
 * Standardized error handling for ALL error sources.
 * Normalizes errors to UiError format and provides consistent display.
 */

import { toast } from "sonner";
import type { ApiResult, ApiError, ApiIssue, ApiErr, ApiOk } from "@/lib/contracts";
import type { UiError } from "@/lib/contracts/errors/ui-error.contract";
import { normalizeError, normalizeApiError } from "@/lib/client/utils/error-normalizer";

/**
 * Error Display Options
 */
export interface ErrorDisplayOptions {
  /** Whether to show toast notification */
  showToast?: boolean;
  /** Custom toast message (overrides error message) */
  toastMessage?: string;
  /** Whether to log error to console */
  logError?: boolean;
  /** Custom error handler */
  onError?: (error: ApiError) => void;
}

/**
 * Default error messages for error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested resource was not found",
  PERMISSION_DENIED: "You don't have permission to perform this action",
  CONFLICT: "This action conflicts with existing data",
  INTERNAL: "An unexpected error occurred. Please try again",
  UNAUTHORIZED: "Please sign in to continue",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  BAD_REQUEST: "Invalid request. Please check your input",
};

/**
 * Get user-friendly error message
 * Falls back to error.message if no custom message exists
 */
export function getErrorMessage(error: ApiError): string {
  return ERROR_MESSAGES[error.code] || error.message || "An error occurred";
}

/**
 * Format validation issues for display
 * Groups issues by field path for better UX
 * Uses proper path formatting (handles arrays, nested objects, special chars)
 */
export function formatValidationIssues(issues?: ApiIssue[]): Record<string, string[]> {
  if (!issues || issues.length === 0) {
    return {};
  }

  const grouped: Record<string, string[]> = {};

  for (const issue of issues) {
    // Format path properly (handles arrays: items[0], nested: user.profile.name)
    const path = issue.path.length > 0 
      ? formatApiIssuePath(issue.path)
      : "root";
    
    if (!grouped[path]) {
      grouped[path] = [];
    }
    
    grouped[path].push(issue.message);
  }

  return grouped;
}

/**
 * Format API issue path to dot notation
 * Handles string/number paths correctly (based on Zod v4 toDotPath)
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
 * Handle any error (unified)
 * Normalizes error to UiError and provides consistent handling
 * 
 * @example
 * ```ts
 * // Works with ApiResult
 * const result = await createTask(data);
 * handleError(result);
 * 
 * // Works with ZodError
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   handleError(error);
 * }
 * 
 * // Works with Better Auth errors
 * const { error } = await authClient.signIn.email(data);
 * if (error) {
 *   handleError(error);
 * }
 * ```
 */
export function handleError(
  error: unknown,
  options: ErrorDisplayOptions = {}
): UiError | null {
  const uiError = normalizeError(error);
  const {
    showToast = true,
    toastMessage,
    logError = true,
    onError,
  } = options;

  // Log error for debugging
  if (logError) {
    console.error("[Error]", {
      title: uiError.title,
      message: uiError.message,
      code: uiError.code,
      fieldErrors: uiError.fieldErrors,
      metadata: uiError.metadata,
    });
  }

  // Show toast notification
  if (showToast) {
    const message = toastMessage || uiError.message;
    
    // Show field errors in toast if available
    if (uiError.fieldErrors && Object.keys(uiError.fieldErrors).length > 0) {
      const fieldErrorsText = Object.entries(uiError.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(", ");
      
      toast.error(message, {
        description: fieldErrorsText,
        duration: 5000,
      });
    } else {
      toast.error(message);
    }
  }

  // Call custom error handler with normalized error
  onError?.(uiError as unknown as ApiError);

  return uiError;
}

/**
 * Handle ApiResult with automatic error handling
 * Returns data if success, handles error if failure
 * 
 * @example
 * ```ts
 * const data = await handleApiResult(createTask(data));
 * if (data) {
 *   // Success - data is available
 * } else {
 *   // Error was already handled
 * }
 * ```
 */
export function handleApiResult<T>(
  result: ApiResult<T>,
  options: ErrorDisplayOptions = {}
): T | null {
  if (result.ok) {
    return result.data;
  }

  // Use unified error handler
  handleError(result, options);
  return null;
}

/**
 * Handle any error and return normalized UiError
 * Useful when you need the normalized error for custom handling
 * 
 * @example
 * ```ts
 * const uiError = handleErrorAndReturn(anyError);
 * if (uiError.code === "VALIDATION_ERROR") {
 *   // Handle validation errors specially
 * }
 * ```
 */
export function handleErrorAndReturn(
  error: unknown,
  options: ErrorDisplayOptions = {}
): UiError {
  return handleError(error, options) || normalizeError(error);
}

/**
 * Create error result helper
 * Useful for creating error responses in server actions
 */
export function createErrorResult(
  code: ApiError["code"],
  message: string,
  issues?: ApiIssue[]
): ApiErr {
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
 * Create success result helper
 * Useful for creating success responses in server actions
 */
export function createSuccessResult<T>(data: T): ApiOk<T> {
  return {
    ok: true,
    data,
  };
}
