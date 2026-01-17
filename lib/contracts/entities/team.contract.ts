/**
 * Team Entity Contract
 * Generated from Drizzle schema with Zod validation
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { teams } from '@/lib/server/drizzle/schema-multitenant'
import { z } from 'zod'

// Enum schemas (reusable)
export const teamStatusSchema = z.enum(['active', 'archived'])

// DB schemas (internal runtime)
export const teamDbSchema = createSelectSchema(teams, {
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
})

export const insertTeamDbSchema = createInsertSchema(teams, {
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(1, "Team name required").max(100, "Name too long").trim(),
  slug: z.string()
    .min(2, "Slug too short")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim(),
  description: z.string().max(500, "Description too long").optional().nullable(),
  parentTeamId: z.string().uuid("Invalid parent team ID").optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
  status: teamStatusSchema.optional(),
  createdBy: z.string().uuid().optional().nullable(),
})

// API schemas (wire format with datetime strings)
export const teamApiSchema = teamDbSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Type exports
export type TeamDb = z.infer<typeof teamDbSchema>
export type InsertTeamDb = z.infer<typeof insertTeamDbSchema>
export type TeamApi = z.infer<typeof teamApiSchema>
export type TeamStatus = z.infer<typeof teamStatusSchema>
