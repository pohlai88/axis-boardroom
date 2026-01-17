/**
 * Validation Performance Tracking
 * 
 * Tracks validation performance to identify bottlenecks and optimize hot paths.
 * Only tracks in development or when explicitly enabled in production.
 */

import { performance } from "perf_hooks";
import type { ZodType } from "zod";
import type { ZodError } from "zod";

// Zod v4 safeParse return type
type SafeParseReturnType<TInput, TOutput> = 
  | { success: true; data: TOutput }
  | { success: false; error: ZodError<TInput> };

/**
 * Performance tracking configuration
 */
const ENABLE_TRACKING = 
  process.env.NODE_ENV === "development" || 
  process.env.ENABLE_VALIDATION_TRACKING === "true";

const SLOW_VALIDATION_THRESHOLD_MS = 10; // Log validations > 10ms

/**
 * Track validation performance
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param label - Label for logging (e.g., "taskSchema", "createTaskInput")
 * @returns Result with validation outcome and duration
 * 
 * @example
 * ```ts
 * const { result, duration } = trackValidation(
 *   taskSchema,
 *   taskData,
 *   "taskSchema"
 * );
 * 
 * if (!result.success) {
 *   // Handle error
 * }
 * ```
 */
export function trackValidation<T>(
  schema: ZodType<T>,
  data: unknown,
  label: string
): { result: SafeParseReturnType<unknown, T>; duration: number } {
  if (!ENABLE_TRACKING) {
    // Skip tracking in production (unless explicitly enabled)
    return {
      result: schema.safeParse(data),
      duration: 0,
    };
  }

  const start = performance.now();
  const result = schema.safeParse(data);
  const duration = performance.now() - start;

  // Log slow validations
  if (duration > SLOW_VALIDATION_THRESHOLD_MS) {
    console.warn(`[Validation Performance] ${label} took ${duration.toFixed(2)}ms`, {
      label,
      duration: duration.toFixed(2),
      success: result.success,
      path: result.success ? undefined : result.error.issues[0]?.path,
    });
  }

  return { result, duration };
}

/**
 * Track validation performance (async version)
 * 
 * For schemas with async refinements or transforms
 * 
 * @example
 * ```ts
 * const { result, duration } = await trackValidationAsync(
 *   asyncTaskSchema,
 *   taskData,
 *   "asyncTaskSchema"
 * );
 * ```
 */
export async function trackValidationAsync<T>(
  schema: ZodType<T>,
  data: unknown,
  label: string
): Promise<{ result: SafeParseReturnType<unknown, T>; duration: number }> {
  if (!ENABLE_TRACKING) {
    return {
      result: await schema.safeParseAsync(data),
      duration: 0,
    };
  }

  const start = performance.now();
  const result = await schema.safeParseAsync(data);
  const duration = performance.now() - start;

  if (duration > SLOW_VALIDATION_THRESHOLD_MS) {
    console.warn(`[Validation Performance] ${label} took ${duration.toFixed(2)}ms`, {
      label,
      duration: duration.toFixed(2),
      success: result.success,
    });
  }

  return { result, duration };
}

/**
 * Get validation performance summary
 * 
 * Can be used to collect metrics for analytics
 */
export interface ValidationMetrics {
  label: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

const metrics: ValidationMetrics[] = [];

/**
 * Collect validation metric (for analytics)
 * 
 * @example
 * ```ts
 * const { result, duration } = trackValidation(schema, data, "task");
 * collectMetric("task", duration, result.success);
 * ```
 */
export function collectMetric(
  label: string,
  duration: number,
  success: boolean
): void {
  if (!ENABLE_TRACKING) return;

  metrics.push({
    label,
    duration,
    success,
    timestamp: Date.now(),
  });

  // Keep only last 1000 metrics to prevent memory leaks
  if (metrics.length > 1000) {
    metrics.shift();
  }
}

/**
 * Get collected metrics (for analytics/reporting)
 */
export function getMetrics(): readonly ValidationMetrics[] {
  return metrics;
}

/**
 * Clear collected metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}
