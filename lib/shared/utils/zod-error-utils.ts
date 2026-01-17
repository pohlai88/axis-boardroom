/**
 * Zod Error Utilities
 * 
 * Utilities for working with Zod v4 error types and paths.
 * Based on Zod v4 core error structure.
 * 
 * Reference: https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/errors.ts
 */

import type { ZodError } from "zod";

/**
 * Format a Zod error path to a dot-notation string
 * Handles strings, numbers, symbols, and nested paths correctly
 * 
 * Based on Zod's internal `toDotPath` utility
 * 
 * @example
 * toDotPath(["user", "profile", "name"]) // => "user.profile.name"
 * toDotPath(["items", 0, "title"]) // => "items[0].title"
 * toDotPath(["data", "key.with.dots"]) // => "data[\"key.with.dots\"]"
 */
export function formatZodPath(path: readonly (string | number | symbol)[]): string {
  const segs: string[] = [];
  
  for (const seg of path) {
    if (typeof seg === "number") {
      segs.push(`[${seg}]`);
    } else if (typeof seg === "symbol") {
      segs.push(`[${JSON.stringify(String(seg))}]`);
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
 * Extract field errors from ZodError using flatten()
 * Returns a flat record of field paths to error messages
 * 
 * @example
 * const error = schema.safeParse(data);
 * if (!error.success) {
 *   const fieldErrors = extractFieldErrors(error.error);
 *   // { "user.email": "Invalid email", "user.name": "Required" }
 * }
 */
export function extractFieldErrors(error: ZodError): Record<string, string> {
  const flattened = error.flatten();
  const fieldErrors: Record<string, string> = {};
  
  // Extract field errors (nested paths handled automatically by flatten)
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
  
  return fieldErrors;
}

/**
 * Extract form-level errors from ZodError
 * These are errors without a specific field path
 * 
 * @example
 * const error = schema.safeParse(data);
 * if (!error.success) {
 *   const formErrors = extractFormErrors(error.error);
 *   // ["Passwords don't match", "Invalid combination"]
 * }
 */
export function extractFormErrors(error: ZodError): string[] {
  const flattened = error.flatten();
  return flattened.formErrors || [];
}

/**
 * Get all issues with formatted paths
 * Useful for debugging or detailed error display
 * 
 * @example
 * const issues = getIssuesWithPaths(error);
 * // [
 * //   { path: "user.email", message: "Invalid email", code: "invalid_string" },
 * //   { path: "items[0].title", message: "Required", code: "too_small" }
 * // ]
 */
export function getIssuesWithPaths(error: ZodError): Array<{
  path: string;
  message: string;
  code?: string;
  input?: unknown;
}> {
  return error.issues.map((issue) => ({
    path: formatZodPath(issue.path),
    message: issue.message,
    code: issue.code,
    input: issue.input,
  }));
}

/**
 * Group issues by path
 * Returns a map of formatted paths to arrays of issues
 * 
 * @example
 * const grouped = groupIssuesByPath(error);
 * // {
 * //   "user.email": [{ message: "Invalid email", code: "invalid_string" }],
 * //   "user.name": [{ message: "Required", code: "too_small" }]
 * // }
 */
export function groupIssuesByPath(error: ZodError): Map<string, typeof error.issues> {
  const grouped = new Map<string, typeof error.issues>();
  
  for (const issue of error.issues) {
    const path = formatZodPath(issue.path);
    const existing = grouped.get(path) || [];
    grouped.set(path, [...existing, issue]);
  }
  
  return grouped;
}

/**
 * Check if error has field-level errors
 */
export function hasFieldErrors(error: ZodError): boolean {
  const flattened = error.flatten();
  return flattened.fieldErrors 
    ? Object.keys(flattened.fieldErrors).length > 0 
    : false;
}

/**
 * Check if error has form-level errors
 */
export function hasFormErrors(error: ZodError): boolean {
  const flattened = error.flatten();
  return (flattened.formErrors?.length || 0) > 0;
}
