# Zod Developer Guide

**Last Updated:** 2026-01-17  
**Status:** 📚 Complete Guide  
**Audience:** All developers working with Zod in this codebase

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [When to Create New Schemas](#when-to-create-new-schemas)
3. [Schema Organization](#schema-organization)
4. [Schema Patterns](#schema-patterns)
5. [Versioning Schemas](#versioning-schemas)
6. [Testing Requirements](#testing-requirements)
7. [Performance Considerations](#performance-considerations)
8. [Common Patterns](#common-patterns)
9. [Anti-Patterns](#anti-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Creating Your First Schema

```typescript
// lib/contracts/entities/my-entity.contract.ts
import { z } from "zod"

export const myEntitySchema = z.object({
  id: z.string().min(1).meta({
    description: "Unique identifier",
    example: "entity_123",
  }),
  name: z.string().min(1).max(100).trim().meta({
    description: "Entity name",
    example: "My Entity",
  }),
})

export type MyEntity = z.infer<typeof myEntitySchema>
```

### Using Schemas

```typescript
// Server Action
import { myEntitySchema } from "@/lib/contracts"

export async function createMyEntity(input: unknown) {
  const validation = myEntitySchema.safeParse(input)
  if (!validation.success) {
    return createValidationErrorResult(validation.error.issues)
  }
  
  // Use validation.data (type-safe)
  return createSuccessResult(validation.data)
}
```

---

## When to Create New Schemas

### ✅ Create a New Schema When:

1. **New Entity** - New domain entity (User, Product, Order, etc.)
2. **New API Endpoint** - New API route needs input/output validation
3. **New Form** - New form needs client-side validation
4. **New Operation** - New business operation (create, update, delete)
5. **Schema Evolution** - Breaking change requires new version

### ❌ Don't Create a New Schema When:

1. **UI-Only Types** - Use `Pick` or `Omit` from existing schemas
2. **Temporary Types** - Use TypeScript types for one-off cases
3. **Internal Helpers** - No runtime validation needed

---

## Schema Organization

### Folder Structure

```
lib/contracts/
├── entities/          # Domain entities (Task, User, Organization)
├── operations/        # Business operations (create, update, delete)
├── forms/             # Form validation schemas
├── api/               # API-specific schemas (envelopes, params)
├── errors/            # Error schemas
├── pages/             # Page prop schemas
├── registry.ts        # Centralized schema registry
└── index.ts           # Barrel exports
```

### Naming Conventions

- **Entities:** `{entity}.contract.ts` (e.g., `task.contract.ts`)
- **Operations:** `{entity}.ops.contract.ts` (e.g., `task.ops.contract.ts`)
- **Forms:** `{entity}.form.contract.ts` (e.g., `task.form.contract.ts`)
- **Schemas:** `{entity}Schema`, `create{Entity}InputSchema`

---

## Schema Patterns

### Entity Schema Pattern

```typescript
// lib/contracts/entities/task.contract.ts
import { z } from "zod"

// Enum schemas (reusable)
export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
])

// Core entity schema
export const taskSchema = z.object({
  id: z.string().min(1).meta({
    description: "Unique task identifier",
    example: "task_123",
  }),
  title: z.string().min(1).max(200).trim().meta({
    description: "Task title",
    example: "Implement feature X",
  }),
  status: taskStatusSchema.meta({
    description: "Current task status",
  }),
})

// Derived schemas
export const insertTaskSchema = taskSchema.omit({ id: true })
export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.string().min(1),
})

// Type exports
export type Task = z.infer<typeof taskSchema>
export type InsertTask = z.infer<typeof insertTaskSchema>
export type UpdateTask = z.infer<typeof updateTaskSchema>
```

### Operation Schema Pattern

```typescript
// lib/contracts/operations/task.ops.contract.ts
import { z } from "zod"
import { insertTaskSchema, updateTaskSchema } from "../entities/task.contract"

export const createTaskInputSchema = insertTaskSchema.meta({
  description: "Input for creating a task",
})

export const updateTaskInputSchema = updateTaskSchema.meta({
  description: "Input for updating a task",
})

export const deleteTaskInputSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
}).meta({
  description: "Input for deleting a task",
})
```

### Form Schema Pattern

```typescript
// lib/contracts/forms/task.form.contract.ts
import { z } from "zod"
import { taskTypeSchema, taskPrioritySchema, taskStatusSchema } from "../entities/task.contract"

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .meta({
      description: "Task title",
      example: "Implement feature X",
    }),
  type: taskTypeSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
})

export type TaskFormData = z.infer<typeof taskFormSchema>
```

---

## Versioning Schemas

### Pattern 1: Additive Changes (Backwards Compatible)

```typescript
// v1 schema
const taskSchemaV1 = z.object({
  id: z.string(),
  title: z.string(),
})

// v2 schema (additive - backwards compatible)
const taskSchemaV2 = taskSchemaV1.extend({
  description: z.string().optional(), // New optional field
})

export const taskSchema = taskSchemaV2
export type Task = z.infer<typeof taskSchema>
```

### Pattern 2: Breaking Changes (Requires Migration)

```typescript
// Create versioned schemas
export const taskSchemaV1 = z.object({...})
export const taskSchemaV2 = z.object({...})

// Migration function
export function migrateTaskV1toV2(v1: TaskV1): TaskV2 {
  return {
    ...v1,
    newField: deriveFromOldData(v1),
  }
}

// Export current version
export const taskSchema = taskSchemaV2
```

See [`lib/contracts/migrations/schema-migrations.ts`](../lib/contracts/migrations/schema-migrations.ts) for migration utilities.

---

## Testing Requirements

### Test File Location

```
lib/contracts/__tests__/
├── entities/
│   └── task.contract.test.ts
├── operations/
│   └── task.ops.contract.test.ts
└── forms/
    └── task.form.contract.test.ts
```

### Test Coverage Requirements

Every schema must have tests for:

1. ✅ **Valid data passes validation**
2. ✅ **Invalid data fails with correct errors**
3. ✅ **Required fields are enforced**
4. ✅ **Optional fields work correctly**
5. ✅ **Edge cases and boundary conditions**

### Example Test

```typescript
import { describe, it, expect } from "vitest"
import { taskSchema } from "../../entities/task.contract"

describe("taskSchema", () => {
  it("validates correct task data", () => {
    const validTask = {
      id: "task_123",
      title: "Test Task",
      type: "feature",
      status: "todo",
      priority: "high",
    }
    
    expect(taskSchema.safeParse(validTask).success).toBe(true)
  })
  
  it("rejects invalid status", () => {
    const invalidTask = { ...validTask, status: "invalid" }
    const result = taskSchema.safeParse(invalidTask)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["status"])
    }
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests once (CI)
npm run test:run
```

---

## Performance Considerations

### 1. Use `.safeParse()` for Untrusted Data

```typescript
// ✅ GOOD: API boundaries, user input
const result = schema.safeParse(unknownInput)
if (!result.success) {
  // Handle error
}
```

### 2. Use `.parse()` for Trusted Data

```typescript
// ✅ GOOD: After validation, internal operations
const validated = schema.parse(knownValidData)
```

### 3. Batch Validation for Arrays

```typescript
// ❌ SLOW: Validating individually
items.forEach(item => itemSchema.parse(item))

// ✅ FAST: Validate array at once
const result = z.array(itemSchema).parse(items)
```

### 4. Schema Creation

```typescript
// ❌ BAD: Schema created in function
function validate(data: unknown) {
  const schema = z.object({ ... })  // Created every call
  return schema.parse(data)
}

// ✅ GOOD: Schema at module level
const schema = z.object({ ... })

function validate(data: unknown) {
  return schema.parse(data)
}
```

### 5. Performance Monitoring

Use `trackValidation()` for hot paths:

```typescript
import { trackValidation } from "@/lib/shared/utils/validation-performance"

const { result, duration } = trackValidation(
  schema,
  data,
  "schemaName"
)

if (duration > 10) {
  // Log slow validation
}
```

---

## Common Patterns

### Pattern 1: API Route Validation

```typescript
// app/api/tasks/route.ts
import { createTaskInputSchema } from "@/lib/contracts"
import { trackValidation } from "@/lib/shared/utils/validation-performance"

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const { result: validation } = trackValidation(
    createTaskInputSchema,
    body,
    "createTaskInput"
  )
  
  if (!validation.success) {
    return NextResponse.json(
      createValidationErrorResult(validation.error.issues),
      { status: 400 }
    )
  }
  
  // Use validation.data (type-safe)
  const result = await createTask(validation.data)
  return NextResponse.json(result)
}
```

### Pattern 2: Server Action Validation

```typescript
// lib/server/actions/tasks.ts
export async function createTaskAction(input: unknown) {
  const validation = createTaskInputSchema.safeParse(input)
  
  if (!validation.success) {
    return createValidationErrorResult(validation.error.issues)
  }
  
  // Use validation.data (type-safe)
  const task = await createTask(validation.data)
  return createSuccessResult(task)
}
```

### Pattern 3: Form Validation

```typescript
// components/forms/task-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taskFormSchema } from "@/lib/contracts"

export function TaskForm() {
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      type: "feature",
      status: "todo",
      priority: "medium",
    },
  })
  
  // Form handling...
}
```

### Pattern 4: Client-Side API Validation

```typescript
// lib/client/api/validated-fetch.ts
import { z } from "zod/v4/mini" // Use mini for client

export async function validatedFetch<T>(
  url: string,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await fetch(url)
  const data = await response.json()
  
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error("Invalid API response")
  }
  
  return result.data
}
```

---

## Anti-Patterns

### ❌ Don't: Create Schemas in Functions

```typescript
// ❌ BAD
function validate(data: unknown) {
  const schema = z.object({ ... })  // Created every call
  return schema.parse(data)
}
```

### ❌ Don't: Validate in Loops

```typescript
// ❌ BAD
items.forEach(item => itemSchema.parse(item))
```

### ❌ Don't: Use `.parse()` for Untrusted Data

```typescript
// ❌ BAD
const data = schema.parse(userInput)  // Throws on error
```

### ❌ Don't: Create Manual Types for Entities

```typescript
// ❌ BAD
type Task = {
  id: string
  title: string
}

// ✅ GOOD
export type Task = z.infer<typeof taskSchema>
```

### ❌ Don't: Skip Validation at Boundaries

```typescript
// ❌ BAD
export async function createTask(input: Task) {  // No validation
  // ...
}

// ✅ GOOD
export async function createTask(input: unknown) {  // Validates
  const validation = createTaskInputSchema.safeParse(input)
  // ...
}
```

---

## Troubleshooting

### Issue: "ZodError is not defined"

**Solution:** Import from the correct Zod variant:

```typescript
// Client-side
import { z } from "zod/v4/mini"
// Use z.core.$ZodError for error checks

// Server-side
import { z } from "zod"
// Use z.ZodError for error checks
```

### Issue: "Schema validation is slow"

**Solution:** 
1. Check if you're validating in loops (use `z.array()` instead)
2. Use performance tracking to identify bottlenecks
3. Consider simplifying complex schemas

### Issue: "Type errors after adding metadata"

**Solution:** Metadata doesn't affect types. If you see type errors, check:
1. Schema structure hasn't changed
2. Type inference is correct: `z.infer<typeof schema>`

### Issue: "Schema not found in registry"

**Solution:**
1. Export schema from contract file
2. Add to `lib/contracts/registry.ts`
3. Re-export from `lib/contracts/index.ts`

---

## Best Practices Summary

1. ✅ **Always validate at boundaries** (API routes, server actions, forms)
2. ✅ **Use `.safeParse()` for untrusted data**
3. ✅ **Use `.parse()` for trusted data** (after validation)
4. ✅ **Add metadata to all schemas** (`.meta()`)
5. ✅ **Write tests for all schemas**
6. ✅ **Use schema registry** for tooling integration
7. ✅ **Version schemas** for breaking changes
8. ✅ **Monitor performance** on hot paths
9. ✅ **Batch validate arrays** (never validate in loops)
10. ✅ **Create schemas at module level** (not in functions)

---

## Related Documentation

- [Zod Enforcement Strategy](ZOD_ENFORCEMENT_STRATEGY.md) - Architectural rules
- [Zod Optimization Opportunities](ZOD_OPTIMIZATION_OPPORTUNITIES.md) - Performance tips
- [Zod Coverage Report](ZOD_COVERAGE_REPORT.md) - Current state
- [Schema Registry](../lib/contracts/registry.ts) - Centralized schema catalog
- [Zod 4 Documentation](https://zod.dev/) - Official docs

---

## Getting Help

- **Questions?** Check the [Troubleshooting](#troubleshooting) section
- **New Pattern?** Review [Common Patterns](#common-patterns)
- **Performance Issues?** See [Performance Considerations](#performance-considerations)
- **Still Stuck?** Ask the team or check existing schemas for examples
