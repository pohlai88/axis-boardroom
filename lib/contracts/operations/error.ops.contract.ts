/**
 * Error Operations Contract
 * Input schemas for error tracking
 */

import { z } from "zod"
import { insertErrorDbSchema } from "../entities/error.contract"

// Create error input (log error)
export const createErrorInputSchema = insertErrorDbSchema.omit({
  id: true,
  createdAt: true,
  timestamp: true,
})

// Batch create errors
export const batchCreateErrorsInputSchema = z.object({
  errors: z.array(createErrorInputSchema).min(1, "At least one error required").max(100, "Max 100 errors per batch"),
})

// Query errors input
export const queryErrorsInputSchema = z.object({
  errorType: z.string().optional(),
  url: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(1000).default(100),
})

// Type exports
export type CreateErrorInput = z.infer<typeof createErrorInputSchema>
export type BatchCreateErrorsInput = z.infer<typeof batchCreateErrorsInputSchema>
export type QueryErrorsInput = z.infer<typeof queryErrorsInputSchema>
