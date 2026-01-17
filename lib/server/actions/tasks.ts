/**
 * Server Actions for Tasks
 * 
 * These functions run on the server and can be called from Client Components.
 * Use "use server" directive to mark them as Server Actions.
 */

"use server";

import "server-only";
import { revalidatePath, cacheTag, updateTag, cacheLife, refresh } from "next/cache";
import { z } from "zod";
import { tasks as seedTasks } from "@/lib/server";
import { createApiLogger, withApiLog } from "@/lib/core/logger-api";
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type DeleteTaskInput,
  type DeleteTasksInput,
  createTaskInputSchema,
  updateTaskInputSchema,
  deleteTaskInputSchema,
  deleteTasksInputSchema,
  taskSchema,
  type ApiResult,
} from "@/lib/contracts";
import { createErrorResult, createSuccessResult, createValidationErrorResult } from "@/lib/server/utils/api-result";
import { trackValidation } from "@/lib/shared/utils/validation-performance";

// In-memory store for demo purposes
// In production, replace with database operations
let taskStore: Task[] = [...seedTasks];

// Logger for task operations (using API logger since server actions are dynamic)
const log = createApiLogger('task', { feature: 'crud' });

/**
 * Get all tasks (server-side) with caching
 * In production, this would fetch from a database
 * 
 * Uses Cache Components 'use cache' directive for improved performance
 * Cached for 1 hour with automatic revalidation
 */
export async function getTasks(): Promise<Task[]> {
  'use cache'
  cacheTag('tasks')
  cacheLife('hours') // Cache for 1 hour
  
  // Simulate async data fetching
  // In production: await db.tasks.findMany()
  return Promise.resolve(taskStore);
}

/**
 * Get a single task by ID with caching
 * 
 * Uses Cache Components 'use cache' directive
 * The id parameter automatically becomes part of the cache key
 */
export async function getTaskById(id: string): Promise<Task | null> {
  'use cache'
  cacheTag('tasks', `task-${id}`)
  cacheLife('hours') // Cache for 1 hour
  
  const task = taskStore.find((t) => t.id === id);
  return Promise.resolve(task || null);
}

/**
 * Filter tasks server-side (optional - can also be done client-side)
 */
export async function getFilteredTasks(filters: {
  status?: string;
  priority?: string[];
  search?: string;
}): Promise<Task[]> {
  let filtered = taskStore;

  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter((t) => filters.priority!.includes(t.priority));
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower)
    );
  }

  return Promise.resolve(filtered);
}

// ============================================
// Mutation Server Actions (Contract-Based)
// ============================================

/**
 * Create a new task (contract-based with envelope response)
 * Validates input with Zod, returns typed ApiResult
 */
export async function createTaskAction(
  input: unknown
): Promise<ApiResult<Task>> {
  'use server'
  
  return withApiLog(log, 'task.create', {}, async () => {
    // Parse and validate input (input: unknown is intentional for runtime safety)
    const { result: validation } = trackValidation(
      createTaskInputSchema,
      input,
      'createTaskInput'
    );
    
    if (!validation.success) {
      return createValidationErrorResult(
        validation.error.issues.map(issue => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
    }

    const validated = validation.data;

    // Generate task ID (in production, use database auto-increment or UUID)
    const taskId = `TASK-${Date.now()}` as Task["id"];

    // Create task
    const newTask: Task = {
      id: taskId,
      ...validated,
    };

    // Validate output before storing (trusted data, use parse)
    const parsedTask = taskSchema.parse(newTask);

    // Add to store (in production: await db.tasks.create(newTask))
    taskStore.push(parsedTask);

    // Invalidate cache
    updateTag('tasks');
    revalidatePath("/tasks");
    refresh();

    log.info({ event: 'task.create.success', taskId }, 'Task created');

    return createSuccessResult(parsedTask);
  }).catch((error) => {
    log.error({ event: 'task.create.error', error }, 'Failed to create task');
    return createErrorResult(
      "INTERNAL",
      "Failed to create task"
    );
  });
}



/**
 * Update an existing task (contract-based with envelope response)
 */
export async function updateTaskAction(
  input: unknown
): Promise<ApiResult<Task>> {
  'use server'
  
  return withApiLog(log, 'task.update', {}, async () => {
    const validation = updateTaskInputSchema.safeParse(input);
    
    if (!validation.success) {
      return createValidationErrorResult(
        validation.error.issues.map(issue => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
    }

    const validated = validation.data;

    // Find task
    const taskIndex = taskStore.findIndex((t) => t.id === validated.id);
    if (taskIndex === -1) {
      return createErrorResult("NOT_FOUND", "Task not found");
    }

    // Update task
    const updatedTask: Task = {
      ...taskStore[taskIndex],
      ...validated,
    };

    // Validate output
    const parsedTask = taskSchema.parse(updatedTask);
    
    taskStore[taskIndex] = parsedTask;

    updateTag('tasks');
    updateTag(`task-${validated.id}`);
    revalidatePath("/tasks");
    refresh();

    return createSuccessResult(parsedTask);
  }).catch((error) => {
    return createErrorResult("INTERNAL", "Failed to update task");
  });
}

/**
 * Delete a task (contract-based with envelope response)
 */
export async function deleteTaskAction(
  input: unknown
): Promise<ApiResult<{ id: string }>> {
  'use server'
  
  return withApiLog(log, 'task.delete', {}, async () => {
    const validation = deleteTaskInputSchema.safeParse(input);
    
    if (!validation.success) {
      return createValidationErrorResult(
        validation.error.issues.map(issue => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
    }

    const validated = validation.data;
    const taskIndex = taskStore.findIndex((t) => t.id === validated.id);
    
    if (taskIndex === -1) {
      return createErrorResult("NOT_FOUND", "Task not found");
    }

    taskStore.splice(taskIndex, 1);

    updateTag('tasks');
    updateTag(`task-${validated.id}`);
    revalidatePath("/tasks");
    refresh();

    return createSuccessResult({ id: validated.id });
  }).catch((error) => {
    return createErrorResult("INTERNAL", "Failed to delete task");
  });
}

/**
 * Bulk delete tasks (contract-based with envelope response)
 */
export async function deleteTasksAction(
  input: unknown
): Promise<ApiResult<{ deletedCount: number; ids: string[] }>> {
  'use server'
  
  return withApiLog(log, 'task.bulkDelete', {}, async () => {
    const validation = deleteTasksInputSchema.safeParse(input);
    
    if (!validation.success) {
      return createValidationErrorResult(
        validation.error.issues.map((issue) => ({
          path: issue.path as (string | number)[],
          message: issue.message,
        }))
      );
    }

    const validated = validation.data;
    const deletedIds: string[] = [];
    
    // Filter out deleted tasks
    taskStore = taskStore.filter((t) => {
      if (validated.ids.includes(t.id)) {
        deletedIds.push(t.id);
        return false;
      }
      return true;
    });

    updateTag('tasks');
    validated.ids.forEach((id: string) => updateTag(`task-${id}`));
    revalidatePath("/tasks");
    refresh();

    return createSuccessResult({ 
      deletedCount: deletedIds.length, 
      ids: deletedIds 
    });
  }).catch((error) => {
    return createErrorResult("INTERNAL", "Failed to delete tasks");
  });
}