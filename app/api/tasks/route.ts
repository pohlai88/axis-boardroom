/**
 * Tasks API Route Handler
 * 
 * Provides REST API endpoints for tasks
 * Useful for external integrations, webhooks, or public API access
 * 
 * Note: For internal app use, prefer Server Actions in lib/actions/tasks.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiLogger, withApiLog } from "@/lib/core/logger-api";
import { 
  getTasks, 
  getTaskById, 
  createTaskAction 
} from "@/lib/server/actions/tasks";
import {
  taskQueryParamsSchema,
  createTaskInputSchema,
  apiResultSchema,
  taskSchema,
} from "@/lib/contracts";
import { zodIssuesToApiIssues, searchParamsToObject } from "@/lib/shared/utils/zod-helpers";
import { createErrorResult, createSuccessResult, createValidationErrorResult } from "@/lib/server/utils/api-result";
import { trackValidation } from "@/lib/shared/utils/validation-performance";

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.tasks', { reqId })
  
  return withApiLog(log, 'api.tasks.list', {}, async () => {
    const searchParams = request.nextUrl.searchParams

    // Validate query params - convert to object, then validate with Zod
    const paramsObj = searchParamsToObject(searchParams)
    const { result: paramsResult } = trackValidation(
      taskQueryParamsSchema.partial(),
      paramsObj,
      'taskQueryParams'
    )
    
    if (!paramsResult.success) {
      const errorResult = createValidationErrorResult(
        zodIssuesToApiIssues(paramsResult.error.issues)
      );
      return NextResponse.json(errorResult, { status: 400 });
    }
    
    const validatedParams = paramsResult.data
    
    const filters = validatedParams

    // Get all tasks (filtered)
    const tasks = await getTasks()
    // TODO: Apply filters to tasks query
    
    log.info({ event: 'api.tasks.list.ok', count: tasks.length }, `Retrieved ${tasks.length} tasks`)
    
    // Validate and return response
    const result = createSuccessResult(tasks);
    return NextResponse.json(result);
  }).catch((error) => {
    log.error({ event: 'api.tasks.list.error', error }, 'Failed to fetch tasks')
    const errorResult = createErrorResult("INTERNAL", "Failed to fetch tasks");
    return NextResponse.json(errorResult, { status: 500 });
  })
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.tasks', { reqId })
  
  return withApiLog(log, 'api.tasks.create', {}, async () => {
    const body = await request.json()
    
    // Validate body
    const { result: bodyValidation } = trackValidation(
      createTaskInputSchema,
      body,
      'createTaskInput'
    )
    if (!bodyValidation.success) {
      const errorResult = createValidationErrorResult(
        bodyValidation.error.issues.map(issue => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
      return NextResponse.json(errorResult, { status: 400 });
    }

    const result = await createTaskAction(bodyValidation.data)

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    log.info({ event: 'api.tasks.create.ok', taskId: result.data.id }, 'Task created via API')
    return NextResponse.json(result, { status: 201 });
  }).catch((error) => {
    log.error({ event: 'api.tasks.create.error', error }, 'Failed to create task')
    const errorResult = createErrorResult("INTERNAL", "Failed to create task");
    return NextResponse.json(errorResult, { status: 500 });
  })
}
