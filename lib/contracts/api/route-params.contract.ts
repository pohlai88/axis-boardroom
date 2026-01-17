/**
 * API Route Params Contracts
 * Zod schemas for Next.js route parameters
 * 
 * Uses template literals (Zod v4) for type-safe route patterns
 */

import { z } from "zod"

// Common ID param (UUID or custom format)
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required").meta({
    description: "Resource identifier",
    example: "abc123",
  }),
})

// Task ID param using template literal for type-safe pattern
// Supports: TASK-123 or alphanumeric IDs
export const taskIdParamSchema = z.object({
  id: z.templateLiteral([
    z.union([
      z.templateLiteral([z.literal("TASK-"), z.string().regex(/^\d+$/)]),
      z.string().regex(/^[a-zA-Z0-9_-]+$/),
    ]),
  ]).meta({
    description: "Task identifier (TASK-123 or alphanumeric)",
    example: "TASK-42",
  }),
})

// UUID param
export const uuidParamSchema = z.object({
  id: z.uuid("Invalid UUID format").meta({
    description: "UUID identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
})

// Slug param
export const slugParamSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .meta({
      description: "URL-friendly identifier",
      example: "my-awesome-slug",
    }),
})

// Type exports
export type IdParam = z.infer<typeof idParamSchema>
export type TaskIdParam = z.infer<typeof taskIdParamSchema>
export type UuidParam = z.infer<typeof uuidParamSchema>
export type SlugParam = z.infer<typeof slugParamSchema>
