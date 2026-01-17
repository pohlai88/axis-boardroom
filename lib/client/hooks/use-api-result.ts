/**
 * useApiResult Hook
 * 
 * Hook for handling ApiResult responses with automatic error handling.
 * Provides consistent error display and state management.
 */

import { useState, useCallback } from "react";
import type { ApiResult, ApiError } from "@/lib/contracts";
import { handleError, handleApiResult, type ErrorDisplayOptions } from "@/lib/client/utils/error-handler";

/**
 * Options for useApiResult hook
 */
export interface UseApiResultOptions extends ErrorDisplayOptions {
  /** Whether to throw on error (default: false) */
  throwOnError?: boolean;
}

/**
 * Result of useApiResult hook
 */
export interface UseApiResultReturn<T> {
  /** Execute async function and handle result */
  execute: (fn: () => Promise<ApiResult<T>>) => Promise<T | null>;
  /** Whether operation is in progress */
  isLoading: boolean;
  /** Last error (if any) */
  error: ApiError | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for handling ApiResult responses
 * 
 * Provides consistent error handling and loading state management.
 * 
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useApiResult();
 * 
 * const handleSubmit = async () => {
 *   const data = await execute(() => createTask(formData));
 *   if (data) {
 *     // Success - data is available
 *     router.push("/tasks");
 *   }
 *   // Error was automatically handled
 * };
 * ```
 */
export function useApiResult<T>(
  options: UseApiResultOptions = {}
): UseApiResultReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UseApiResultReturn<T>["error"]>(null);

  const execute = useCallback(
    async (fn: () => Promise<ApiResult<T>>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();

        if (!result.ok) {
          setError(result.error);
          
          if (options.throwOnError) {
            throw new Error(result.error.message);
          }

          handleError(result, options);
          return null;
        }

        return result.data;
      } catch (err) {
        // Handle unexpected errors
        const apiError: ApiError = {
          code: "INTERNAL",
          message: err instanceof Error ? err.message : "An unexpected error occurred",
        };
        
        setError(apiError);
        
        if (options.throwOnError) {
          throw err;
        }

        handleError(
          { ok: false, error: apiError },
          options
        );
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    clearError,
  };
}
