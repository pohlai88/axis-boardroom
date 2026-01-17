/**
 * Zod Import Helper
 * 
 * Centralized imports for Zod variants to optimize bundle size.
 * - Client-side: Use zod/v4/mini (85% smaller)
 * - Server-side: Use full zod (all features)
 */

// Client-side: Mini variant (smaller bundle)
export { z as zodMini } from "zod/v4/mini";

// Server-side: Full variant (all features)
export { z as zodFull } from "zod";

// Re-export types that work with both
export type { ZodType, ZodTypeAny } from "zod";
export { ZodError } from "zod";
import type { ZodError } from "zod";

// Zod v4 safeParse return type (not exported from zod)
export type SafeParseReturnType<TInput, TOutput> = 
  | { success: true; data: TOutput }
  | { success: false; error: ZodError<TInput> };
