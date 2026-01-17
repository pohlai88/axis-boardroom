/**
 * Server Component Props Contracts
 * Zod schemas for Server Component route params and searchParams
 */

import { z } from "zod"

// Auth path param (for /auth/[path])
export const authPathParamSchema = z.object({
  path: z.enum(["sign-in", "sign-up", "forgot-password", "verify-email", "reset-password"]),
})

// Tasks page searchParams
export const tasksSearchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done", "canceled"]).optional(),
  priority: z.string().optional(), // Comma-separated: "high,medium"
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
})

// Type exports
export type AuthPathParam = z.infer<typeof authPathParamSchema>
export type TasksSearchParams = z.infer<typeof tasksSearchParamsSchema>
