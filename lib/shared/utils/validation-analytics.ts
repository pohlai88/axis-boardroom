/**
 * Validation Analytics
 * 
 * Collects validation metrics for production monitoring and optimization.
 * Tracks validation frequency, duration, and failure rates per schema.
 */

import type { ValidationMetrics } from "./validation-performance";
import { getMetrics, clearMetrics } from "./validation-performance";

/**
 * Validation analytics configuration
 */
const ENABLE_ANALYTICS = 
  process.env.ENABLE_VALIDATION_ANALYTICS === "true" ||
  process.env.NODE_ENV === "production";

/**
 * Analytics data structure
 */
export interface ValidationAnalytics {
  schema: string;
  count: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  maxDuration: number;
  commonErrors: Array<{
    path: string;
    message: string;
    count: number;
  }>;
}

/**
 * Collect validation metrics
 * 
 * This should be called periodically (e.g., every minute) to collect
 * metrics from the validation performance tracker.
 */
export function collectValidationAnalytics(): ValidationAnalytics[] {
  if (!ENABLE_ANALYTICS) {
    return [];
  }

  const metrics = getMetrics();
  const schemaMap = new Map<string, ValidationMetrics[]>();

  // Group metrics by schema label
  for (const metric of metrics) {
    if (!schemaMap.has(metric.label)) {
      schemaMap.set(metric.label, []);
    }
    schemaMap.get(metric.label)!.push(metric);
  }

  // Calculate analytics for each schema
  const analytics: ValidationAnalytics[] = [];

  for (const [schema, schemaMetrics] of schemaMap.entries()) {
    const durations = schemaMetrics
      .map(m => m.duration)
      .sort((a, b) => a - b);

    const successCount = schemaMetrics.filter(m => m.success).length;
    const failureCount = schemaMetrics.length - successCount;

    // Calculate percentiles
    const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

    // Collect common errors (would need error details in metrics)
    const commonErrors: Array<{ path: string; message: string; count: number }> = [];

    analytics.push({
      schema,
      count: schemaMetrics.length,
      successCount,
      failureCount,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
      p50Duration: p50,
      p95Duration: p95,
      p99Duration: p99,
      maxDuration: durations[durations.length - 1] || 0,
      commonErrors,
    });
  }

  return analytics;
}

/**
 * Send analytics to monitoring system
 * 
 * This function should be integrated with your analytics/monitoring system
 * (e.g., Vercel Analytics, DataDog, CloudWatch, etc.)
 */
export async function sendValidationAnalytics(
  analytics: ValidationAnalytics[]
): Promise<void> {
  if (!ENABLE_ANALYTICS || analytics.length === 0) {
    return;
  }

  // Example: Send to analytics endpoint
  // In production, integrate with your actual analytics system
  if (typeof fetch !== "undefined") {
    try {
      await fetch("/api/analytics/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          metrics: analytics,
        }),
      });
    } catch (error) {
      console.error("[Validation Analytics] Failed to send metrics", error);
    }
  }
}

/**
 * Periodic analytics collection
 * 
 * Call this function periodically (e.g., every minute) to collect
 * and send validation analytics.
 */
export async function collectAndSendAnalytics(): Promise<void> {
  const analytics = collectValidationAnalytics();
  
  if (analytics.length > 0) {
    await sendValidationAnalytics(analytics);
    clearMetrics(); // Clear after sending
  }
}

/**
 * Get analytics summary for a specific schema
 */
export function getSchemaAnalytics(schemaName: string): ValidationAnalytics | null {
  const analytics = collectValidationAnalytics();
  return analytics.find(a => a.schema === schemaName) || null;
}

/**
 * Get slowest schemas (for optimization)
 */
export function getSlowestSchemas(limit: number = 10): ValidationAnalytics[] {
  const analytics = collectValidationAnalytics();
  return analytics
    .sort((a, b) => b.p95Duration - a.p95Duration)
    .slice(0, limit);
}

/**
 * Get schemas with highest failure rates
 */
export function getSchemasWithFailures(limit: number = 10): ValidationAnalytics[] {
  const analytics = collectValidationAnalytics();
  return analytics
    .filter(a => a.failureCount > 0)
    .sort((a, b) => {
      const aRate = a.failureCount / a.count;
      const bRate = b.failureCount / b.count;
      return bRate - aRate;
    })
    .slice(0, limit);
}
