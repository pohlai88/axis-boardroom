/**
 * Server Actions Index
 * Central export point for all server actions
 */

export {
  getTasks,
  getTaskById,
  getFilteredTasks,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  deleteTasksAction,
} from "./tasks";

// Re-export types from contracts
export type { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  DeleteTaskInput,
  DeleteTasksInput,
  ApiResult 
} from "@/lib/contracts";
