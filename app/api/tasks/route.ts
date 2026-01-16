/**
 * Tasks API Route Handler
 * 
 * Provides REST API endpoints for tasks
 * Useful for external integrations, webhooks, or public API access
 * 
 * Note: For internal app use, prefer Server Actions in lib/actions/tasks.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "@/lib/actions/tasks";
import { z } from "zod";

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      // Get single task
      const task = await getTaskById(id);
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      return NextResponse.json(task);
    }

    // Get all tasks
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const createTaskSchema = z.object({
      title: z.string().min(1).max(200),
      type: z.enum(["bug", "feature", "documentation"]),
      status: z.enum(["backlog", "todo", "in_progress", "done", "canceled"]).default("todo"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
    });

    const validated = createTaskSchema.parse(body);
    const result = await createTask(validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
