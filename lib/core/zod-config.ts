/**
 * Global Zod Configuration
 * 
 * Configures Zod's global error handling and development settings.
 * Import this file early in your app initialization.
 */

import { z } from "zod";

/**
 * Global error map for custom error messages
 * 
 * This runs for all schemas unless overridden by schema-level or per-parse errors.
 */
z.config({
  customError: (iss) => {
    // Add timestamp for debugging in development
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      
      // Log validation failures in development
      console.warn(`[Zod Validation] ${timestamp}:`, {
        code: iss.code,
        path: iss.path,
        input: iss.input,
      });
    }
    
    // Return undefined to defer to schema-level messages
    // This allows schema-specific error messages to take precedence
    return undefined;
  },
});

/**
 * Enable input reporting in development
 * 
 * This includes the input value in error issues for better debugging.
 * Disabled in production to prevent logging sensitive data.
 */
if (process.env.NODE_ENV === "development") {
  // Note: reportInput is set per-parse, not globally
  // This is a reminder to use it in development
  // Example: schema.safeParse(data, { reportInput: true })
}

/**
 * Development-only: Monkey-patch parse methods to always report input
 * 
 * Uncomment this if you want all validations in dev to include input:
 */
/*
if (process.env.NODE_ENV === "development") {
  const originalParse = z.ZodType.prototype.parse;
  const originalSafeParse = z.ZodType.prototype.safeParse;
  
  z.ZodType.prototype.parse = function (data: unknown, params?: any) {
    return originalParse.call(this, data, {
      ...params,
      reportInput: true,
    });
  };
  
  z.ZodType.prototype.safeParse = function (data: unknown, params?: any) {
    return originalSafeParse.call(this, data, {
      ...params,
      reportInput: true,
    });
  };
}
*/

/**
 * Error precedence reminder:
 * 
 * 1. Schema-level: z.string("Custom error") - HIGHEST PRIORITY
 * 2. Per-parse: schema.parse(data, { error: (iss) => ... })
 * 3. Global: z.config({ customError: (iss) => ... }) - CURRENT FILE
 * 4. Locale: z.config(z.locales.en()) - LOWEST PRIORITY
 */
