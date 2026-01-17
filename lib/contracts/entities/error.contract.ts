/**
 * Error Entity Contract
 * Generated from Drizzle schema with Zod validation
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { errors } from '@/lib/server/drizzle/schema'
import { z } from 'zod'

// DB schemas (internal runtime)
export const errorDbSchema = createSelectSchema(errors)

export const insertErrorDbSchema = createInsertSchema(errors, {
  message: z.string().min(1, "Error message required").max(5000, "Message too long"),
  filename: z.string().max(500).optional().nullable(),
  lineno: z.number().int().nonnegative().optional().nullable(),
  colno: z.number().int().nonnegative().optional().nullable(),
  error: z.string().max(1000).optional().nullable(),
  stack: z.string().max(10000).optional().nullable(),
  url: z.string().url("Invalid URL"),
  userAgent: z.string().max(500).optional().nullable(),
  errorType: z.string().max(100).optional().nullable(),
})

// API schemas (wire format with datetime strings)
export const errorApiSchema = errorDbSchema.extend({
  timestamp: z.string().datetime().nullable(),
  createdAt: z.string().datetime().nullable(),
})

// Type exports
export type ErrorDb = z.infer<typeof errorDbSchema>
export type InsertErrorDb = z.infer<typeof insertErrorDbSchema>
export type ErrorApi = z.infer<typeof errorApiSchema>
