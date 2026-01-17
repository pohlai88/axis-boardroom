/**
 * Zod API Utilities
 * Minimal helpers - let Zod do the work!
 * 
 * Based on Zod v4 core error structure:
 * https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/errors.ts
 */

import type { ApiIssue } from "@/lib/contracts"
import type { z } from "zod"
import { formatZodPath } from "./zod-error-utils"

/**
 * Convert Zod issues to API issues
 * Uses proper path formatting based on Zod v4 core error structure
 * 
 * Paths are properly formatted to handle:
 * - Arrays: `items[0]`, `items[1]`
 * - Nested objects: `user.profile.name`
 * - Special characters: `data["key.with.dots"]`
 * 
 * Reference: https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/errors.ts
 */
export function zodIssuesToApiIssues(issues: z.ZodIssue[]): ApiIssue[] {
  return issues.map(issue => ({
    // Keep path as array for API contract (matches Zod's PropertyKey[] structure)
    path: issue.path.filter((p): p is string | number => 
      typeof p === "string" || typeof p === "number"
    ) as (string | number)[],
    message: issue.message,
  }))
}

/**
 * Convert URLSearchParams to plain object for Zod validation
 */
export function searchParamsToObject(searchParams: URLSearchParams): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}
  
  searchParams.forEach((value, key) => {
    const existing = params[key]
    if (existing) {
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      params[key] = value
    }
  })
  
  return params
}
