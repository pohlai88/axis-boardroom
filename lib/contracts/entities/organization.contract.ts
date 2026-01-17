/**
 * Organization Entity Contract
 * Generated from Drizzle schema with Zod validation
 */

import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { organizations } from '@/lib/server/drizzle/schema-multitenant'
import { z } from 'zod'

// Branded ID schemas for type safety
export const organizationIdSchema = z.string().uuid().brand<"OrganizationId">().meta({
  description: "Organization identifier (branded type)",
  example: "550e8400-e29b-41d4-a716-446655440000",
})

export type OrganizationId = z.infer<typeof organizationIdSchema>

// Enum schemas (reusable)
export const organizationStatusSchema = z.enum(['active', 'suspended', 'archived'])

// DB schemas (internal runtime)
export const organizationDbSchema = createSelectSchema(organizations, {
  settings: z.object({
    features: z.array(z.string()).optional(),
    max_users: z.number().positive().optional(),
  }).passthrough().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
})

export const insertOrganizationDbSchema = createInsertSchema(organizations, {
  name: z.string().min(1, "Organization name required").max(100, "Name too long").trim(),
  slug: z.string()
    .min(2, "Slug too short")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim(),
  domain: z.string()
    .min(3, "Domain too short")
    .max(100, "Domain too long")
    .regex(/^[a-z0-9.-]+$/, "Invalid domain format")
    .optional().nullable(),
  logoUrl: z.string().url("Invalid logo URL").optional().nullable(),
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional().nullable(),
  settings: z.object({
    features: z.array(z.string()).optional(),
    max_users: z.number().positive().optional(),
  }).passthrough().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  status: organizationStatusSchema.optional(),
  neonAuthOrgId: z.string().uuid().optional().nullable(),
  createdBy: z.string().uuid().optional().nullable(),
})

// Update schema - all fields optional for partial updates
// Reference: https://orm.drizzle.team/docs/zod#update-schema
export const updateOrganizationDbSchema = createUpdateSchema(organizations, {
  name: z.string().min(1, "Organization name required").max(100, "Name too long").trim().optional(),
  slug: z.string()
    .min(2, "Slug too short")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim()
    .optional(),
  domain: z.string()
    .min(3, "Domain too short")
    .max(100, "Domain too long")
    .regex(/^[a-z0-9.-]+$/, "Invalid domain format")
    .optional()
    .nullable(),
  logoUrl: z.string().url("Invalid logo URL").optional().nullable(),
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional()
    .nullable(),
  settings: z.object({
    features: z.array(z.string()).optional(),
    max_users: z.number().positive().optional(),
  }).passthrough().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  status: organizationStatusSchema.optional(),
  neonAuthOrgId: z.string().uuid().optional().nullable(),
})

// API schemas (wire format with datetime strings)
export const organizationApiSchema = organizationDbSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Type exports
export type OrganizationDb = z.infer<typeof organizationDbSchema>
export type InsertOrganizationDb = z.infer<typeof insertOrganizationDbSchema>
export type UpdateOrganizationDb = z.infer<typeof updateOrganizationDbSchema>
export type OrganizationApi = z.infer<typeof organizationApiSchema>
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>
