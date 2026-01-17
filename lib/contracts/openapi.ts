/**
 * OpenAPI Integration
 * 
 * Generates OpenAPI 3.0 specifications from Zod schemas.
 * Enables automatic API documentation generation.
 */

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { schemaRegistry } from "./registry";

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

/**
 * Enhanced task schema with OpenAPI metadata
 * 
 * @example
 * ```ts
 * const taskSchemaWithDocs = taskSchema.openapi({
 *   description: "Task entity representing work items",
 *   example: {
 *     id: "task_abc123",
 *     title: "Implement feature X",
 *     type: "feature",
 *     status: "in_progress",
 *     priority: "high",
 *   },
 * });
 * ```
 */
export const taskSchemaWithDocs = schemaRegistry.entities.task.openapi({
  description: "Task entity representing work items in the system",
  example: {
    id: "task_abc123",
    title: "Implement user authentication",
    type: "feature",
    status: "in_progress",
    priority: "high",
  },
});

/**
 * Enhanced create task input schema with OpenAPI metadata
 */
export const createTaskInputSchemaWithDocs = schemaRegistry.operations.createTask.openapi({
  description: "Input schema for creating a new task",
  example: {
    title: "Implement user authentication",
    type: "feature",
    status: "todo",
    priority: "high",
  },
});

/**
 * Generate OpenAPI spec from schema registry
 * 
 * This function can be used to generate a complete OpenAPI specification
 * from all registered schemas.
 * 
 * @example
 * ```ts
 * const spec = generateOpenAPISpec({
 *   title: "AXIS BoardRoom API",
 *   version: "1.0.0",
 *   description: "API documentation for AXIS BoardRoom",
 * });
 * ```
 */
export function generateOpenAPISpec(config: {
  title: string;
  version: string;
  description?: string;
  servers?: Array<{ url: string; description?: string }>;
}) {
  // This is a placeholder - actual implementation would use zod-to-openapi
  // to generate the full OpenAPI spec from all schemas in the registry
  
  return {
    openapi: "3.0.0",
    info: {
      title: config.title,
      version: config.version,
      description: config.description,
    },
    servers: config.servers || [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    paths: {
      // Paths would be generated from route handlers
      // This is a template structure
    },
    components: {
      schemas: {
        // Schemas would be generated from schemaRegistry
        // This is a template structure
      },
    },
  };
}

/**
 * Helper to add OpenAPI metadata to any schema
 * 
 * @example
 * ```ts
 * const schemaWithDocs = addOpenAPIMetadata(
 *   taskSchema,
 *   {
 *     description: "Task entity",
 *     example: { id: "task_123", title: "Test" },
 *   }
 * );
 * ```
 */
export function addOpenAPIMetadata<T extends z.ZodTypeAny>(
  schema: T,
  metadata: {
    description?: string;
    example?: unknown;
    examples?: unknown[];
  }
): T {
  return schema.openapi(metadata) as T;
}
