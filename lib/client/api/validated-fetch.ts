/**
 * Validated Fetch Utility
 * 
 * Wrapper around fetch() that validates API responses with Zod schemas
 * and handles ApiResult error envelopes consistently.
 */

import { z } from "zod/v4/mini";
import type { $ZodType } from "zod/v4/core";
import { apiResultSchema, type ApiResult } from "@/lib/contracts";
import { handleError } from "@/lib/client/utils/error-handler";
import { formatZodPath } from "@/lib/shared/utils/zod-error-utils";

/**
 * Fetch with runtime validation of ApiResult response
 * Automatically handles error envelopes and throws on error
 * 
 * @example
 * ```ts
 * const tasks = await validatedFetch(
 *   "/api/tasks",
 *   z.array(taskSchema)
 * );
 * ```
 * 
 * @throws {Error} If HTTP request fails or response doesn't match schema
 */
export async function validatedFetch<T>(
  url: string,
  schema: $ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json();
      const errorResult = apiResultSchema(z.any()).safeParse(errorData);
      
      if (errorResult.success && !errorResult.data.ok) {
        // Handle standardized error envelope
        handleError(errorResult.data, { showToast: false });
        throw new Error(errorResult.data.error.message);
      }
    } catch {
      // Fallback to HTTP error
    }
    
    throw new Error(
      `HTTP ${response.status}: ${response.statusText} (${url})`
    );
  }

  const data = await response.json();
  
  // Validate as ApiResult envelope
  const resultSchema = apiResultSchema(schema);
  const result = resultSchema.safeParse(data);

  if (!result.success) {
    console.error("[API Validation Error]", {
      url,
      status: response.status,
      errors: result.error.flatten(),
      receivedData: data,
    });
    throw new Error(
      `Invalid API response shape for ${url}: ${result.error.issues
        .map((e) => {
          const path = e.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number");
          return `${formatZodPath(path)}: ${e.message}`;
        })
        .join(", ")}`
    );
  }

  // Handle error response
  if (!result.data.ok) {
    handleError(result.data, { showToast: false });
    throw new Error(result.data.error.message);
  }

  // Return success data
  return result.data.data;
}

/**
 * Fetch ApiResult response (doesn't throw on error)
 * Returns the full ApiResult for manual handling
 * 
 * @example
 * ```ts
 * const result = await validatedFetchResult(
 *   "/api/tasks",
 *   z.array(taskSchema)
 * );
 * if (result.ok) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export async function validatedFetchResult<T>(
  url: string,
  schema: $ZodType<T>,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(url, init);

  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json();
      const errorResult = apiResultSchema(z.any()).safeParse(errorData);
      
      if (errorResult.success && !errorResult.data.ok) {
        return errorResult.data;
      }
    } catch {
      // Fallback to generic error
    }
    
    return {
      ok: false,
      error: {
        code: "INTERNAL",
        message: `HTTP ${response.status}: ${response.statusText}`,
      },
    };
  }

  const data = await response.json();
  const resultSchema = apiResultSchema(schema);
  const result = resultSchema.safeParse(data);

  if (!result.success) {
    console.error("[API Validation Error]", {
      url,
      status: response.status,
      errors: result.error.flatten(),
      receivedData: data,
    });
    
    return {
      ok: false,
      error: {
        code: "INTERNAL",
        message: "Invalid API response shape",
        issues: result.error.issues.map((issue) => ({
          path: issue.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
          message: issue.message,
        })),
      },
    };
  }

  return result.data;
}
