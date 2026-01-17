/**
 * Tasks API Response Contracts
 * Response schemas for tasks endpoints
 * 
 * Uses Zod Mini for client-side bundle optimization
 */

import { z } from "zod/v4/mini";
import { taskSchema, type Task } from "../entities/task.contract";
import { apiOkSchema, apiErrSchema } from "./envelopes.contract";

// Tasks GET Response Schema (array of tasks)
export const tasksResponseSchema = apiOkSchema(z.array(taskSchema));

export type TasksResponse = z.infer<typeof tasksResponseSchema>;

// Task GET Response Schema (single task)
export const taskResponseSchema = apiOkSchema(taskSchema);

export type TaskResponse = z.infer<typeof taskResponseSchema>;

// Task POST/PATCH Response Schema
export const taskMutationResponseSchema = apiOkSchema(taskSchema);

export type TaskMutationResponse = z.infer<typeof taskMutationResponseSchema>;

// Task DELETE Response Schema
export const taskDeleteResponseSchema = apiOkSchema(
  z.object({
    id: z.string(),
  })
);

export type TaskDeleteResponse = z.infer<typeof taskDeleteResponseSchema>;
