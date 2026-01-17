/**
 * Task Operations Contract
 * Input schemas for task mutations
 */

import { z } from "zod"
import { insertTaskSchema, updateTaskSchema } from "../entities/task.contract"

// Create task input
export const createTaskInputSchema = insertTaskSchema.extend({
  // Add any additional create-specific fields here if needed
}).meta({
  description: "Input schema for creating a new task",
  example: {
    title: "Implement user authentication",
    type: "feature",
    status: "todo",
    priority: "high",
  },
})

// Update task input
export const updateTaskInputSchema = updateTaskSchema.meta({
  description: "Input schema for updating an existing task",
  example: {
    id: "task_123",
    title: "Updated task title",
    priority: "high",
  },
})

// Delete task input
export const deleteTaskInputSchema = z.object({
  id: z.string().min(1, "Task ID is required").meta({
    description: "ID of the task to delete",
    example: "task_123",
  }),
}).meta({
  description: "Input schema for deleting a task",
})

// Bulk delete input
export const deleteTasksInputSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one task ID required").meta({
    description: "Array of task IDs to delete",
    example: ["task_123", "task_456"],
  }),
}).meta({
  description: "Input schema for bulk deleting tasks",
})

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>
export type DeleteTasksInput = z.infer<typeof deleteTasksInputSchema>
