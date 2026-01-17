/**
 * Analytics API Response Contracts
 * Response schemas for analytics endpoints
 * 
 * Uses Zod Mini for client-side bundle optimization
 */

import { z } from "zod/v4/mini";
import { webVitalApiSchema, type WebVitalApi } from "../entities/web-vital.contract";
import { errorApiSchema, type ErrorApi } from "../entities/error.contract";

// Web Vitals Aggregates Schema
export const webVitalAggregateSchema = z.object({
  count: z.number(),
  avg: z.number(),
  min: z.number(),
  max: z.number(),
  p50: z.number(),
  p75: z.number(),
  p95: z.number(),
  p99: z.number(),
});

export type WebVitalAggregate = z.infer<typeof webVitalAggregateSchema>;

// Web Vitals GET Response Schema
export const webVitalsResponseSchema = z.object({
  metrics: z.array(webVitalApiSchema),
  aggregates: z.record(z.string(), webVitalAggregateSchema),
  total: z.number(),
});

export type WebVitalsResponse = z.infer<typeof webVitalsResponseSchema>;

// Error Group Schema
export const errorGroupSchema = z.object({
  message: z.string(),
  count: z.number(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  errors: z.array(errorApiSchema),
});

export type ErrorGroup = z.infer<typeof errorGroupSchema>;

// Errors GET Response Schema
export const errorsResponseSchema = z.object({
  errors: z.array(errorApiSchema),
  grouped: z.array(errorGroupSchema),
  total: z.number(),
});

export type ErrorsResponse = z.infer<typeof errorsResponseSchema>;
