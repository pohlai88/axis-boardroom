/**
 * WebVital Operations Contract
 * Input schemas for web vitals tracking
 */

import { z } from "zod"
import { insertWebVitalDbSchema } from "../entities/web-vital.contract"

// Create web vital input (track metric)
export const createWebVitalInputSchema = insertWebVitalDbSchema.omit({
  id: true,
  createdAt: true,
  timestamp: true,
})

// Batch create web vitals
export const batchCreateWebVitalsInputSchema = z.object({
  vitals: z.array(createWebVitalInputSchema).min(1, "At least one vital required").max(100, "Max 100 vitals per batch"),
})

// Query web vitals input
export const queryWebVitalsInputSchema = z.object({
  metricId: z.string().optional(),
  url: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(1000).default(100),
})

// Type exports
export type CreateWebVitalInput = z.infer<typeof createWebVitalInputSchema>
export type BatchCreateWebVitalsInput = z.infer<typeof batchCreateWebVitalsInputSchema>
export type QueryWebVitalsInput = z.infer<typeof queryWebVitalsInputSchema>
