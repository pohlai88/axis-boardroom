/**
 * Task Form Contract Tests
 * 
 * Tests for task form schema validation
 */

import { describe, it, expect } from "vitest";
import { taskFormSchema } from "../../forms/task.form.contract";

describe("taskFormSchema", () => {
  const validFormData = {
    title: "Test Task",
    type: "feature",
    status: "todo",
    priority: "high",
  };

  it("validates correct form data", () => {
    const result = taskFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validFormData);
    }
  });

  it("rejects missing title", () => {
    const invalidForm = { ...validFormData };
    delete (invalidForm as any).title;

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["title"]);
      expect(result.error.issues[0].message).toContain("required");
    }
  });

  it("rejects empty title", () => {
    const invalidForm = {
      ...validFormData,
      title: "",
    };

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["title"]);
      expect(result.error.issues[0].message).toContain("required");
    }
  });

  it("rejects title that is too long", () => {
    const invalidForm = {
      ...validFormData,
      title: "a".repeat(201), // Over 200 chars
    };

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["title"]);
      expect(result.error.issues[0].message).toContain("200");
    }
  });

  it("trims whitespace from title", () => {
    const formWithWhitespace = {
      ...validFormData,
      title: "  Test Task  ",
    };

    const result = taskFormSchema.safeParse(formWithWhitespace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Task");
    }
  });

  it("rejects invalid status", () => {
    const invalidForm = {
      ...validFormData,
      status: "invalid",
    };

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["status"]);
    }
  });

  it("rejects invalid priority", () => {
    const invalidForm = {
      ...validFormData,
      priority: "critical",
    };

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["priority"]);
    }
  });

  it("rejects invalid type", () => {
    const invalidForm = {
      ...validFormData,
      type: "invalid",
    };

    const result = taskFormSchema.safeParse(invalidForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["type"]);
    }
  });

  it("accepts all valid status values", () => {
    const validStatuses = ["backlog", "todo", "in_progress", "done", "canceled"];

    for (const status of validStatuses) {
      const form = { ...validFormData, status };
      const result = taskFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid priority values", () => {
    const validPriorities = ["low", "medium", "high"];

    for (const priority of validPriorities) {
      const form = { ...validFormData, priority };
      const result = taskFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid type values", () => {
    const validTypes = ["bug", "feature", "documentation"];

    for (const type of validTypes) {
      const form = { ...validFormData, type };
      const result = taskFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    }
  });
});
