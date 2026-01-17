/**
 * Validated Query Hook
 * 
 * Wrapper around TanStack Query's useQuery that validates API responses
 * with Zod schemas at runtime. Catches shape mismatches before they cause bugs.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod/v4/mini";
import type { $ZodType } from "zod/v4/core";
import { formatZodPath } from "@/lib/shared/utils/zod-error-utils";

// Type that has safeParse method (works with both Zod and Zod Mini)
// Note: Zod Mini's error type may not have flatten(), so we make it optional
type ZodSchemaWithParse<T> = $ZodType<T> & {
  safeParse: (data: unknown) => { 
    success: boolean; 
    data?: T; 
    error?: { 
      issues: Array<{ path: PropertyKey[]; message: string }>; 
      flatten?: () => { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    } 
  };
};

/**
 * Validated query hook that ensures API responses match expected schema
 * 
 * @example
 * ```ts
 * const { data } = useValidatedQuery({
 *   queryKey: ["tasks"],
 *   queryFn: async () => {
 *     const res = await fetch("/api/tasks");
 *     return res.json();
 *   },
 *   schema: z.array(taskApiSchema),
 * });
 * ```
 */
export function useValidatedQuery<
  TData,
  TSchema extends ZodSchemaWithParse<TData>,
  TError = Error,
>(
  options: Omit<UseQueryOptions<unknown, TError, TData>, "select"> & {
    schema: TSchema;
  }
) {
  return useQuery<unknown, TError, TData>({
    ...options,
    select: (data) => {
      const result = options.schema.safeParse(data);
      if (!result.success || !result.data) {
        const error = result.error;
        if (error) {
          const flattened = error.flatten ? error.flatten() : { fieldErrors: {}, formErrors: [] };
          console.error("[API Validation Error]", {
            queryKey: options.queryKey,
            errors: flattened,
            receivedData: data,
          });
          throw new Error(
            `Invalid API response shape: ${error.issues
              .map((e: { path: PropertyKey[]; message: string }) => {
                const path = e.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number");
                return `${formatZodPath(path)}: ${e.message}`;
              })
              .join(", ")}`
          );
        }
        throw new Error("Invalid API response shape");
      }
      return result.data;
    },
  });
}
