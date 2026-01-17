/**
 * Task Entity Contract Tests
 * 
 * Tests for task entity schema validation
 */

import { describe, it, expect } from "vitest";
import {
  taskSchema,
  taskStatusSchema,
  taskPrioritySchema,
  taskTypeSchema,
  insertTaskSchema,
  updateTaskSchema,
} from "../../entities/task.contract";

describe("taskSchema", () => {
  const validTask = {
    id: "task_123",
    title: "Test Task",
    type: "feature",
    status: "todo",
    priority: "high",
  };

  it("validates correct task data", () => {
    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validTask);
    }
  });

  it("rejects missing required fields", () => {
    const invalidTask = { ...validTask };
    delete (invalidTask as any).id;

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["id"]);
    }
  });

  it("rejects invalid status", () => {
    const invalidTask = { ...validTask, status: "invalid" };
    const result = taskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["status"]);
    }
  });

  it("rejects invalid priority", () => {
    const invalidTask = { ...validTask, priority: "critical" };
    const result = taskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["priority"]);
    }
  });

  it("rejects invalid type", () => {
    const invalidTask = { ...validTask, type: "invalid" };
    const result = taskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["type"]);
    }
  });

  it("trims whitespace from title", () => {
    const taskWithWhitespace = {
      ...validTask,
      title: "  Test Task  ",
    };

    const result = taskSchema.safeParse(taskWithWhitespace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Task");
    }
  });

  it("rejects title that is too long", () => {
    const invalidTask = {
      ...validTask,
      title: "a".repeat(201), // Over 200 chars
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["title"]);
    }
  });

  it("rejects empty title", () => {
    const invalidTask = {
      ...validTask,
      title: "",
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["title"]);
    }
  });
});

describe("taskStatusSchema", () => {
  it("accepts valid status values", () => {
    const validStatuses = ["backlog", "todo", "in_progress", "done", "canceled"];

    for (const status of validStatuses) {
      const result = taskStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(status);
      }
    }
  });

  it("rejects invalid status", () => {
    const result = taskStatusSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("taskPrioritySchema", () => {
  it("accepts valid priority values", () => {
    const validPriorities = ["low", "medium", "high"];

    for (const priority of validPriorities) {
      const result = taskPrioritySchema.safeParse(priority);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(priority);
      }
    }
  });

  it("rejects invalid priority", () => {
    const result = taskPrioritySchema.safeParse("critical");
    expect(result.success).toBe(false);
  });
});

describe("taskTypeSchema", () => {
  it("accepts valid type values", () => {
    const validTypes = ["bug", "feature", "documentation"];

    for (const type of validTypes) {
      const result = taskTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(type);
      }
    }
  });

  it("rejects invalid type", () => {
    const result = taskTypeSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("insertTaskSchema", () => {
  it("validates task without id", () => {
    const validInsert = {
      title: "Test Task",
      type: "feature",
      status: "todo",
      priority: "high",
    };

    const result = insertTaskSchema.safeParse(validInsert);
    expect(result.success).toBe(true);
  });

  it("rejects task with id", () => {
    const invalidInsert = {
      id: "task_123",
      title: "Test Task",
      type: "feature",
      status: "todo",
      priority: "high",
    };

    const result = insertTaskSchema.safeParse(invalidInsert);
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("validates partial task update with id", () => {
    const validUpdate = {
      id: "task_123",
      title: "Updated Title",
    };

    const result = updateTaskSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("validates update with only id", () => {
    const validUpdate = {
      id: "task_123",
    };

    const result = updateTaskSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rejects update without id", () => {
    const invalidUpdate = {
      title: "Updated Title",
    };

    const result = updateTaskSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["id"]);
    }
  });
});
