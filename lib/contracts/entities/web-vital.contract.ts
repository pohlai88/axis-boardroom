/**
 * WebVital Entity Contract
 * Generated from Drizzle schema with Zod validation
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { webVitals } from '@/lib/server/drizzle/schema'
import { z } from 'zod'

// DB schemas (internal runtime)
export const webVitalDbSchema = createSelectSchema(webVitals)

export const insertWebVitalDbSchema = createInsertSchema(webVitals, {
  name: z.string().min(1, "Metric name required").max(50, "Name too long"),
  value: z.string().regex(/^\d+\.?\d*$/, "Value must be a valid number"),
  metricId: z.string().min(1, "Metric ID required"),
  url: z.string().url("Invalid URL"),
  delta: z.string().regex(/^\d+\.?\d*$/, "Delta must be a valid number").optional().nullable(),
  userAgent: z.string().max(500).optional().nullable(),
})

// API schemas (wire format with datetime strings)
export const webVitalApiSchema = webVitalDbSchema.extend({
  timestamp: z.string().datetime().nullable(),
  createdAt: z.string().datetime().nullable(),
})

// Type exports
export type WebVitalDb = z.infer<typeof webVitalDbSchema>
export type InsertWebVitalDb = z.infer<typeof insertWebVitalDbSchema>
export type WebVitalApi = z.infer<typeof webVitalApiSchema>
