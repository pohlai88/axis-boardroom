/**
 * Common Zod Schema Patterns
 * 
 * Reusable schema patterns for consistent validation across the application.
 * Uses Zod Mini for client-side bundle optimization where applicable.
 */

import { z } from "zod/v4/mini";

/**
 * Common ID Pattern
 * Branded string ID for type safety
 * Note: Branding in Zod Mini requires using the method, not a function
 */
export const createIdSchema = <T extends string>(_brand: T) =>
  z.string()
    .check(z.minLength(1, "ID is required"))
    .brand<T>();

/**
 * Timestamp Pattern
 * ISO datetime string with validation
 * 
 * Validates ISO 8601 datetime format (e.g., "2024-01-20T10:30:00.000Z")
 * Uses regex validation compatible with Zod Mini's functional API
 */
export const timestampSchema = z
  .string()
  .check(
    z.regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/,
      "Must be a valid ISO 8601 datetime string (e.g., 2024-01-20T10:30:00.000Z)"
    )
  );

/**
 * Pagination Pattern
 * Reusable pagination schema with coercion
 */
export const paginationSchema = z.object({
  page: z._default(
    z.coerce.number().check(
      z.gte(1, "Page must be at least 1"),
      z.int("Page must be an integer")
    ),
    1
  ),
  limit: z._default(
    z.coerce.number().check(
      z.gte(1, "Limit must be at least 1"),
      z.lte(100, "Limit cannot exceed 100"),
      z.int("Limit must be an integer")
    ),
    10
  ),
});

/**
 * Sort Pattern
 * Reusable sorting schema
 */
export const sortSchema = z.object({
  sortBy: z.optional(z.string()),
  sortOrder: z._default(
    z.optional(z.enum(["asc", "desc"])),
    "asc"
  ),
});

/**
 * Date Range Pattern
 * Start and end date validation
 */
export const dateRangeSchema = z.object({
  startDate: z.optional(timestampSchema),
  endDate: z.optional(timestampSchema),
}).check(
  z.refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: "Start date must be before or equal to end date" }
  )
);

/**
 * Search Pattern
 * Common search query validation
 */
export const searchSchema = z.object({
  q: z.optional(
    z.string().check(
      z.minLength(1, "Search query must be at least 1 character"),
      z.maxLength(100, "Search query must be 100 characters or less")
    )
  ),
});

/**
 * Email Pattern
 * Reusable email validation with normalization (lowercase + trim)
 * Use this for all email fields to ensure consistency
 */
export const emailSchema = z
  .string()
  .check(
    z.minLength(1, "Email is required"),
    z.email("Invalid email address"),
    z.toLowerCase(),
    z.trim()
  )
  .brand<"Email">();

/**
 * Metadata Pattern
 * Optional metadata object
 */
export const metadataSchema = z.optional(
  z.record(z.string(), z.unknown())
);

// Type exports
export type Pagination = z.infer<typeof paginationSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Email = z.infer<typeof emailSchema>;