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
import { tasks as seedTasks, type Task, type TaskStatus, type TaskPriority, type TaskType } from "@/lib/seed";

// In-memory store for demo purposes
// In production, replace with database operations
let taskStore: Task[] = [...seedTasks];

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
// Validation Schemas
// ============================================

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  type: z.enum(["bug", "feature", "documentation"]),
  status: z.enum(["backlog", "todo", "in_progress", "done", "canceled"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

const updateTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["bug", "feature", "documentation"]).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done", "canceled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const deleteTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});

// ============================================
// Mutation Server Actions
// ============================================

// Form action state type for useActionState (Next.js best practice)
export type TaskFormState = {
  message?: string;
  error?: string;
  task?: Task;
};

// Legacy ActionResult type (kept for backward compatibility)
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a new task (form action for useActionState)
 * Models expected errors as return values (Next.js best practice)
 */
export async function createTaskAction(
  prevState: TaskFormState | null,
  formData: FormData
): Promise<TaskFormState> {
  'use server'
  
  // Extract and validate input
  const input = {
    title: formData.get('title') as string,
    type: formData.get('type') as Task['type'],
    status: formData.get('status') as Task['status'] || 'todo',
    priority: formData.get('priority') as Task['priority'] || 'medium',
  };

  // Validate input - return error state instead of throwing
  const validation = createTaskSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const validated = validation.data;

  // Generate task ID (in production, use database auto-increment or UUID)
  const taskId = `TASK-${Date.now()}`;

  // Create task
  const newTask: Task = {
    id: taskId,
    title: validated.title,
    type: validated.type,
    status: validated.status,
    priority: validated.priority,
  };

  // Add to store (in production: await db.tasks.create(newTask))
  taskStore.push(newTask);

  // Invalidate cache using updateTag for immediate refresh
  updateTag('tasks');
  
  // Revalidate the tasks page
  revalidatePath("/tasks");
  
  // Refresh client router to show updated UI
  refresh();

  return { message: "Task created successfully", task: newTask };
}

/**
 * Create a new task (legacy API - kept for backward compatibility)
 */
export async function createTask(
  input: z.infer<typeof createTaskSchema>
): Promise<ActionResult<Task>> {
  try {
    // Validate input
    const validated = createTaskSchema.parse(input);

    // Generate task ID (in production, use database auto-increment or UUID)
    const taskId = `TASK-${Date.now()}`;

    // Create task
    const newTask: Task = {
      id: taskId,
      title: validated.title,
      type: validated.type,
      status: validated.status,
      priority: validated.priority,
    };

    // Add to store (in production: await db.tasks.create(newTask))
    taskStore.push(newTask);

    // Invalidate cache using updateTag for immediate refresh
    updateTag('tasks');
    
    // Revalidate the tasks page
    revalidatePath("/tasks");
    
    // Refresh client router to show updated UI
    refresh();

    return { success: true, data: newTask };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Update an existing task (form action for useActionState)
 * Models expected errors as return values (Next.js best practice)
 */
export async function updateTaskAction(
  prevState: TaskFormState | null,
  formData: FormData
): Promise<TaskFormState> {
  'use server'
  
  // Extract and validate input
  const input = {
    id: formData.get('id') as string,
    title: formData.get('title') as string | undefined,
    type: formData.get('type') as Task['type'] | undefined,
    status: formData.get('status') as Task['status'] | undefined,
    priority: formData.get('priority') as Task['priority'] | undefined,
  };

  // Validate input - return error state instead of throwing
  const validation = updateTaskSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const validated = validation.data;

  // Find task
  const taskIndex = taskStore.findIndex((t) => t.id === validated.id);
  if (taskIndex === -1) {
    return { error: "Task not found" };
  }

  // Update task (in production: await db.tasks.update(...))
  const updatedTask: Task = {
    ...taskStore[taskIndex],
    ...(validated.title && { title: validated.title }),
    ...(validated.type && { type: validated.type }),
    ...(validated.status && { status: validated.status }),
    ...(validated.priority && { priority: validated.priority }),
  };

  taskStore[taskIndex] = updatedTask;

  // Invalidate cache using updateTag for immediate refresh
  updateTag('tasks');
  updateTag(`task-${validated.id}`);
  
  // Revalidate the tasks page
  revalidatePath("/tasks");
  
  // Refresh client router to show updated UI
  refresh();

  return { message: "Task updated successfully", task: updatedTask };
}

/**
 * Update an existing task (legacy API - kept for backward compatibility)
 */
export async function updateTask(
  input: z.infer<typeof updateTaskSchema>
): Promise<ActionResult<Task>> {
  try {
    // Validate input
    const validated = updateTaskSchema.parse(input);

    // Find task
    const taskIndex = taskStore.findIndex((t) => t.id === validated.id);
    if (taskIndex === -1) {
      return { success: false, error: "Task not found" };
    }

    // Update task (in production: await db.tasks.update(...))
    const updatedTask: Task = {
      ...taskStore[taskIndex],
      ...(validated.title && { title: validated.title }),
      ...(validated.type && { type: validated.type }),
      ...(validated.status && { status: validated.status }),
      ...(validated.priority && { priority: validated.priority }),
    };

    taskStore[taskIndex] = updatedTask;

    // Invalidate cache using updateTag for immediate refresh
    updateTag('tasks');
    updateTag(`task-${validated.id}`);
    
    // Revalidate the tasks page
    revalidatePath("/tasks");
    
    // Refresh client router to show updated UI
    refresh();

    return { success: true, data: updatedTask };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to update task" };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  input: z.infer<typeof deleteTaskSchema>
): Promise<ActionResult<void>> {
  try {
    // Validate input
    const validated = deleteTaskSchema.parse(input);

    // Find task
    const taskIndex = taskStore.findIndex((t) => t.id === validated.id);
    if (taskIndex === -1) {
      return { success: false, error: "Task not found" };
    }

    // Delete task (in production: await db.tasks.delete(...))
    taskStore.splice(taskIndex, 1);

    // Invalidate cache using updateTag for immediate refresh
    updateTag('tasks');
    updateTag(`task-${validated.id}`);
    
    // Revalidate the tasks page
    revalidatePath("/tasks");
    
    // Refresh client router to show updated UI
    refresh();

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to delete task" };
  }
}

/**
 * Delete multiple tasks
 */
export async function deleteTasks(
  ids: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: "No task IDs provided" };
    }

    // Delete tasks (in production: await db.tasks.deleteMany({ id: { in: ids } }))
    const initialLength = taskStore.length;
    taskStore = taskStore.filter((t) => !ids.includes(t.id));
    const deletedCount = initialLength - taskStore.length;

    // Invalidate cache using updateTag for immediate refresh
    updateTag('tasks');
    // Also invalidate individual task caches
    ids.forEach(id => updateTag(`task-${id}`));
    
    // Revalidate the tasks page
    revalidatePath("/tasks");
    
    // Refresh client router to show updated UI
    refresh();

    return { success: true, data: { deletedCount } };
  } catch (error) {
    return { success: false, error: "Failed to delete tasks" };
  }
}
