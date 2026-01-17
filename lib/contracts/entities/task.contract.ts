/**
 * Task Entity Contract
 * Single source of truth for Task domain
 */

import { z } from "zod"

// Branded ID schemas for type safety
export const taskIdSchema = z.string().min(1).brand<"TaskId">().meta({
  description: "Task identifier (branded type)",
  example: "task_123",
})

export type TaskId = z.infer<typeof taskIdSchema>

// Enum schemas (reusable)
export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
])

export const taskPrioritySchema = z.enum(["low", "medium", "high"])

export const taskTypeSchema = z.enum(["bug", "feature", "documentation"])

// Core task schema (matches current in-memory structure)
export const taskSchema = z.object({
  id: taskIdSchema,
  title: z
    .string({ error: "Task title is required" })
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or less")
    .trim()
    .meta({
      description: "Task title or summary",
      example: "Implement user authentication",
    }),
  type: taskTypeSchema.meta({
    description: "Type of task",
  }),
  status: taskStatusSchema.meta({
    description: "Current status of the task",
  }),
  priority: taskPrioritySchema.meta({
    description: "Priority level of the task",
  }),
})

// Insert schema (for creation)
export const insertTaskSchema = taskSchema.omit({ id: true })

// Update schema (all fields optional except id)
export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: taskIdSchema,
})

// Type exports
export type Task = z.infer<typeof taskSchema>
export type InsertTask = z.infer<typeof insertTaskSchema>
export type UpdateTask = z.infer<typeof updateTaskSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type TaskType = z.infer<typeof taskTypeSchema>
