/**
 * Server Actions Index
 * 
 * Central export for all server actions.
 * All functions in this directory run on the server.
 */

export {
  getTasks,
  getTaskById,
  getFilteredTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteTasks,
  createTaskAction,
  updateTaskAction,
  type ActionResult,
  type TaskFormState,
} from "./tasks";
