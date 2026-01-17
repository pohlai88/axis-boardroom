/**
 * Response Validation Utility
 * 
 * Validates API route handler responses with Zod schemas.
 * Ensures responses match expected contract before sending to client.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validates and wraps response data in ApiResult envelope
 * 
 * @param data - Response data to validate
 * @param schema - Zod schema for the data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with validated data
 * 
 * @example
 * ```ts
 * const tasks = await getTasks();
 * return validateResponse(tasks, z.array(taskSchema));
 * ```
 */
export function validateResponse<T>(
  data: T,
  schema: z.ZodType<T>,
  status: number = 200
): NextResponse {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("[Response Validation Error]", {
      errors: result.error.flatten(),
      receivedData: data,
    });

    // Return error response if validation fails
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL",
          message: "Invalid response shape",
          issues: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data: result.data }, { status });
}

/**
 * Validates error response
 * 
 * @param error - Error object
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error envelope
 */
export function validateErrorResponse(
  error: {
    code: string;
    message: string;
    issues?: Array<{ path: (string | number)[]; message: string }>;
  },
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error,
    },
    { status }
  );
}
