/**
 * devAssert Utility
 *
 * Zod contract gates for composite props validation.
 * Validates with Zod in dev, zero cost in production.
 *
 * @example
 * ```ts
 * const safe = devAssert(ApprovalPanelSchema, props, "ApprovalPanelProps");
 * ```
 */

import { z } from "zod";

/**
 * Assert that a value matches a Zod schema (dev-only)
 *
 * In development: validates and throws on failure
 * In production: returns value as-is (zero cost)
 *
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @param name - Name for error reporting
 * @returns Validated value (type-safe)
 * @throws Error in dev if validation fails
 */
export function devAssert<T>(
  schema: z.ZodType<T>,
  value: unknown,
  name: string
): T {
  if (process.env.NODE_ENV === "production") {
    return value as T;
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    console.error(`[AXIS] Invalid ${name}`, parsed.error.flatten());
    throw new Error(`[AXIS] Invalid ${name} (see console)`);
  }

  return parsed.data;
}
