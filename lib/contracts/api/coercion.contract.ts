/**
 * Coercion Contracts
 * 
 * Schemas using z.coerce for type conversion at API boundaries.
 * Useful for query parameters, FormData, and environment variables.
 */

import { z } from "zod";

/**
 * Query Parameters with Coercion
 * 
 * Query params are always strings, so we use z.coerce to convert them.
 */
export const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).meta({
    description: "Page number (1-indexed)",
    example: 1,
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).meta({
    description: "Number of items per page",
    example: 20,
  }),
  sortBy: z.string().optional().meta({
    description: "Field to sort by",
    example: "createdAt",
  }),
});

/**
 * Search Form with Coercion
 * 
 * Form data often comes as strings and needs conversion.
 */
export const searchFormSchema = z.object({
  minPrice: z.coerce.number().min(0).optional().meta({
    description: "Minimum price filter",
    example: 0,
  }),
  maxPrice: z.coerce.number().min(0).optional().meta({
    description: "Maximum price filter",
    example: 1000,
  }),
  inStock: z.coerce.boolean().optional().meta({
    description: "Filter by in-stock status",
    example: true,
  }),
});

/**
 * Environment Variables with Coercion
 * 
 * Environment variables are always strings.
 */
export const envCoercionSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]),
  ENABLE_FEATURE: z.coerce.boolean().default(false),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
});
