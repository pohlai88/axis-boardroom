/**
 * Log Entry Contracts
 * Zod schemas for client-side log ingestion
 * 
 * Uses Zod Mini for client-side bundle optimization
 */

import { z } from "zod/v4/mini"

// Log level enum
export const logLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"])

// Event prefix validation (allowlist) - using Zod Mini functional API
export const logEventSchema = z.string().check(
  z.refine(
    (event) => {
      const allowedPrefixes = ["ui.", "perf.", "error."]
      return allowedPrefixes.some(prefix => event.startsWith(prefix))
    },
    { message: "Event must start with allowed prefix (ui., perf., error.)" }
  )
)

// Client log entry schema
export const clientLogEntrySchema = z.object({
  level: logLevelSchema,
  event: logEventSchema,
  message: z.string().check(
    z.minLength(1, "Message is required"),
    z.maxLength(500, "Message must be 500 characters or less")
  ),
  timestamp: z.optional(z.string()),
  metadata: z.optional(z.record(z.string(), z.unknown())),
})

// Batch log ingestion
export const clientLogBatchSchema = z.object({
  logs: z.array(clientLogEntrySchema).check(z.maxLength(50, "Maximum 50 logs per batch")),
})

// Type exports
export type LogLevel = z.infer<typeof logLevelSchema>
export type ClientLogEntry = z.infer<typeof clientLogEntrySchema>
export type ClientLogBatch = z.infer<typeof clientLogBatchSchema>
