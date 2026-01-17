/**
 * Task Form Contract
 * Form validation schema derived from operations
 */

import { z } from "zod/v4/mini"
import { taskTypeSchema, taskPrioritySchema, taskStatusSchema } from "../entities/task.contract"

// Form schema with user-friendly error messages
// All fields required (no .default() to avoid optional types)
export const taskFormSchema = z.object({
  title: z
    .string()
    .check(
      z.minLength(1, "Title is required"),
      z.maxLength(200, "Title must be less than 200 characters"),
      z.trim()
    ),

  type: taskTypeSchema.meta({
    description: "Type of task",
  }),

  status: taskStatusSchema.meta({
    description: "Task status",
  }),

  priority: taskPrioritySchema.meta({
    description: "Task priority",
  }),
})

export type TaskFormData = z.infer<typeof taskFormSchema>
