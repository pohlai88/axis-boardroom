/**
 * Tasks Page - Server Component
 * 
 * This page fetches data on the server and passes it to the Client Component
 * for interactivity. This pattern optimizes:
 * - Initial page load (data fetched on server)
 * - JavaScript bundle size (only interactive parts are client-side)
 * - SEO (content rendered on server)
 * - Streaming with React Suspense for progressive loading
 */

import { Suspense } from "react";
import { getTasks } from "@/lib/server/actions/tasks";
import { TasksClient } from "./tasks-client";
import TasksLoading from "./loading";

export default async function TasksPage() {
  // Fetch tasks on the server (with caching)
  // Wrapped in Suspense for streaming support
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksPageContent />
    </Suspense>
  );
}

async function TasksPageContent() {
  const tasks = await getTasks();
  return <TasksClient initialTasks={tasks} />;
}
