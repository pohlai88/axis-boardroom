/**
 * API Query Params Contracts
 * Zod schemas for Next.js searchParams (query strings)
 * 
 * Uses common patterns from common-patterns.contract.ts for consistency
 */

import { z } from "zod"
// Note: common-patterns uses Zod Mini, but query params are server-side (full Zod)
// We'll recreate patterns here for server-side compatibility

// Pagination params (using coercion for cleaner code)
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).meta({
    description: "Page number (1-indexed)",
    example: 1,
  }),
  limit: z.coerce.number().int().positive().max(100).default(10).meta({
    description: "Number of items per page",
    example: 10,
  }),
})

// Sorting params
export const sortParamsSchema = z.object({
  sortBy: z.string().optional().meta({
    description: "Field to sort by",
    example: "createdAt",
  }),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc").meta({
    description: "Sort order",
    example: "asc",
  }),
})

// Search params
export const searchParamsSchema = z.object({
  q: z.string().min(1).max(100).optional().meta({
    description: "Search query string",
    example: "user authentication",
  }),
})

// Date range params
export const dateRangeParamsSchema = z.object({
  startDate: z.string().datetime().optional().meta({
    description: "Start date (inclusive)",
    example: "2024-01-01T00:00:00.000Z",
  }),
  endDate: z.string().datetime().optional().meta({
    description: "End date (inclusive)",
    example: "2024-12-31T23:59:59.999Z",
  }),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: "Start date must be before or equal to end date" }
)

// Task filter params
export const taskFilterParamsSchema = z.object({
  status: z.enum(["backlog", "todo", "in_progress", "done", "canceled"]).optional().meta({
    description: "Filter by task status",
    example: "in_progress",
  }),
  priority: z.enum(["low", "medium", "high"]).optional().meta({
    description: "Filter by task priority",
    example: "high",
  }),
  type: z.enum(["bug", "feature", "documentation"]).optional().meta({
    description: "Filter by task type",
    example: "feature",
  }),
})

// Combined task query params (using spread for better composition)
export const taskQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...sortParamsSchema.shape,
  ...searchParamsSchema.shape,
  ...taskFilterParamsSchema.shape,
})

// Type exports
export type PaginationParams = z.infer<typeof paginationParamsSchema>
export type SortParams = z.infer<typeof sortParamsSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type DateRangeParams = z.infer<typeof dateRangeParamsSchema>
export type TaskFilterParams = z.infer<typeof taskFilterParamsSchema>
export type TaskQueryParams = z.infer<typeof taskQueryParamsSchema>
