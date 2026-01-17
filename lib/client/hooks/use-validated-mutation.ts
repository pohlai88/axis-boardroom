/**
 * Validated Mutation Hook
 * 
 * Wrapper around TanStack Query's useMutation that validates mutation responses
 * with Zod schemas at runtime. Catches shape mismatches before they cause bugs.
 */

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { z } from "zod/v4/mini";
import type { $ZodType } from "zod/v4/core";
import { formatZodPath } from "@/lib/shared/utils/zod-error-utils";

// Type that has safeParse method (works with both Zod and Zod Mini)
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
 * Validated mutation hook that ensures mutation responses match expected schema
 * 
 * @example
 * ```ts
 * const mutation = useValidatedMutation({
 *   mutationFn: async (data) => {
 *     const res = await fetch("/api/tasks", {
 *       method: "POST",
 *       body: JSON.stringify(data),
 *     });
 *     return res.json();
 *   },
 *   schema: taskMutationResponseSchema,
 * });
 * ```
 */
export function useValidatedMutation<
  TData,
  TSchema extends ZodSchemaWithParse<TData>,
  TError = Error,
  TVariables = void,
>(
  options: Omit<UseMutationOptions<unknown, TError, TData, TVariables>, "mutationFn"> & {
    mutationFn: (variables: TVariables) => Promise<unknown>;
    schema: TSchema;
  }
) {
  const { mutationFn: originalMutationFn, schema, ...restOptions } = options;
  
  return useMutation<unknown, TError, TData, TVariables>({
    ...restOptions,
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const data = await originalMutationFn(variables);
      const result = schema.safeParse(data);
      
      if (!result.success || !result.data) {
        const error = result.error;
        if (error) {
          const flattened = error.flatten ? error.flatten() : { fieldErrors: {}, formErrors: [] };
          console.error("[Mutation Validation Error]", {
            errors: flattened,
            receivedData: data,
          });
          throw new Error(
            `Invalid mutation response shape: ${error.issues
              .map((e: { path: PropertyKey[]; message: string }) => {
                const path = e.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number");
                return `${formatZodPath(path)}: ${e.message}`;
              })
              .join(", ")}`
          );
        }
        throw new Error("Invalid mutation response shape");
      }
      
      return result.data;
    },
  });
}
