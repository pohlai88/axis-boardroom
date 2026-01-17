/**
 * Task Detail API Route Handler
 * 
 * Provides REST API endpoints for individual tasks
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiLogger, withApiLog } from "@/lib/core/logger-api";
import { 
  getTaskById, 
  updateTaskAction, 
  deleteTaskAction 
} from "@/lib/server/actions/tasks";
import { 
  taskIdParamSchema,
  type UpdateTaskInput,
  updateTaskInputSchema
} from "@/lib/contracts";
import { zodIssuesToApiIssues } from "@/lib/shared/utils/zod-helpers";
import { createErrorResult, createSuccessResult, createValidationErrorResult } from "@/lib/server/utils/api-result";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.tasks', { reqId })
  
  return withApiLog(log, 'api.tasks.get', {}, async () => {
    // Validate route params with Zod
    const params = await context.params
    const paramsResult = taskIdParamSchema.safeParse(params)
    
    if (!paramsResult.success) {
      const errorResult = createValidationErrorResult(
        zodIssuesToApiIssues(paramsResult.error.issues)
      );
      return NextResponse.json(errorResult, { status: 400 });
    }
    
    const { id } = paramsResult.data
    const task = await getTaskById(id)

    if (!task) {
      log.warn({ event: 'api.tasks.get.not_found', taskId: id }, 'Task not found')
      const errorResult = createErrorResult("NOT_FOUND", "Task not found");
      return NextResponse.json(errorResult, { status: 404 });
    }

    return NextResponse.json(createSuccessResult(task));
  }).catch((error) => {
    log.error({ event: 'api.tasks.get.error', error }, 'Failed to fetch task')
    const errorResult = createErrorResult("INTERNAL", "Failed to fetch task");
    return NextResponse.json(errorResult, { status: 500 });
  })
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.tasks', { reqId })
  
  return withApiLog(log, 'api.tasks.update', {}, async () => {
    // Validate route params with Zod
    const params = await context.params
    const paramsResult = taskIdParamSchema.safeParse(params)
    
    if (!paramsResult.success) {
      const errorResult = createValidationErrorResult(
        zodIssuesToApiIssues(paramsResult.error.issues)
      );
      return NextResponse.json(errorResult, { status: 400 });
    }
    
    const { id } = paramsResult.data
    const body = await request.json()

    // Validate body
    const bodyValidation = updateTaskInputSchema.safeParse({ ...body, id })
    if (!bodyValidation.success) {
      const errorResult = createValidationErrorResult(
        bodyValidation.error.issues.map(issue => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
      return NextResponse.json(errorResult, { status: 400 });
    }

    const result = await updateTaskAction(bodyValidation.data)

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }).catch((error) => {
    log.error({ event: 'api.tasks.update.error', error }, 'Failed to update task')
    const errorResult = createErrorResult("INTERNAL", "Failed to update task");
    return NextResponse.json(errorResult, { status: 500 });
  })
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const reqId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createApiLogger('api.tasks', { reqId })
  
  return withApiLog(log, 'api.tasks.delete', {}, async () => {
    // Validate route params with Zod
    const params = await context.params
    const paramsResult = taskIdParamSchema.safeParse(params)
    
    if (!paramsResult.success) {
      const errorResult = createValidationErrorResult(
        zodIssuesToApiIssues(paramsResult.error.issues)
      );
      return NextResponse.json(errorResult, { status: 400 });
    }
    
    const { id } = paramsResult.data
    const result = await deleteTaskAction({ id })

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }).catch((error) => {
    log.error({ event: 'api.tasks.delete.error', error }, 'Failed to delete task')
    const errorResult = createErrorResult("INTERNAL", "Failed to delete task");
    return NextResponse.json(errorResult, { status: 500 });
  })
}
