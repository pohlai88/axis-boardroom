/**
 * Schema Registry
 * 
 * Centralized registry of all Zod schemas for tooling integration:
 * - Runtime introspection
 * - OpenAPI generation
 * - Documentation automation
 * - Schema migration tooling
 * - Testing utilities
 */

import { z } from "zod";

// Entities
import * as taskEntity from "./entities/task.contract";
import * as webVitalEntity from "./entities/web-vital.contract";
import * as errorEntity from "./entities/error.contract";
import * as organizationEntity from "./entities/organization.contract";
import * as teamEntity from "./entities/team.contract";
import * as membershipEntity from "./entities/membership.contract";

// Operations
import * as taskOps from "./operations/task.ops.contract";
import * as organizationOps from "./operations/organization.ops.contract";
import * as teamOps from "./operations/team.ops.contract";
import * as membershipOps from "./operations/membership.ops.contract";
import * as webVitalOps from "./operations/web-vital.ops.contract";
import * as errorOps from "./operations/error.ops.contract";

// Forms
import * as taskForm from "./forms/task.form.contract";
import * as authForm from "./forms/auth.form.contract";

// API
import * as apiEnvelopes from "./api/envelopes.contract";
import * as apiRouteParams from "./api/route-params.contract";
import * as apiQueryParams from "./api/query-params.contract";
import * as apiLogEntry from "./api/log-entry.contract";
import * as apiAnalyticsResponses from "./api/analytics-responses.contract";
import * as apiTasksResponses from "./api/tasks-responses.contract";

// Errors
import * as uiError from "./errors/ui-error.contract";

// Pages
import * as serverComponentProps from "./pages/server-component-props.contract";

/**
 * Centralized Schema Registry
 * 
 * All schemas organized by category for easy access and tooling integration
 */
export const schemaRegistry = {
  version: "1.0.0",
  
  entities: {
    task: taskEntity.taskSchema,
    taskStatus: taskEntity.taskStatusSchema,
    taskPriority: taskEntity.taskPrioritySchema,
    taskType: taskEntity.taskTypeSchema,
    insertTask: taskEntity.insertTaskSchema,
    updateTask: taskEntity.updateTaskSchema,
    
    webVital: webVitalEntity.webVitalApiSchema,
    
    error: errorEntity.errorApiSchema,
    
    organization: organizationEntity.organizationApiSchema,
    
    team: teamEntity.teamApiSchema,
    
    membership: membershipEntity.membershipApiSchema,
  },
  
  operations: {
    // Task operations
    createTask: taskOps.createTaskInputSchema,
    updateTask: taskOps.updateTaskInputSchema,
    deleteTask: taskOps.deleteTaskInputSchema,
    deleteTasks: taskOps.deleteTasksInputSchema,
    
    // Organization operations
    createOrganization: organizationOps.createOrganizationInputSchema,
    updateOrganization: organizationOps.updateOrganizationInputSchema,
    deleteOrganization: organizationOps.deleteOrganizationInputSchema,
    
    // Team operations
    createTeam: teamOps.createTeamInputSchema,
    updateTeam: teamOps.updateTeamInputSchema,
    deleteTeam: teamOps.deleteTeamInputSchema,
    
    // Membership operations
    createMembership: membershipOps.createMembershipInputSchema,
    updateMembership: membershipOps.updateMembershipInputSchema,
    deleteMembership: membershipOps.deleteMembershipInputSchema,
    
    // Analytics operations
    createWebVital: webVitalOps.createWebVitalInputSchema,
    createError: errorOps.createErrorInputSchema,
  },
  
  forms: {
    taskForm: taskForm.taskFormSchema,
    signupForm: authForm.signupFormSchema,
    loginForm: authForm.loginFormSchema,
    magicLinkForm: authForm.magicLinkFormSchema,
  },
  
  api: {
    // Envelopes
    apiResult: apiEnvelopes.apiResultSchema,
    
    // Route params
    idParam: apiRouteParams.idParamSchema,
    taskIdParam: apiRouteParams.taskIdParamSchema,
    uuidParam: apiRouteParams.uuidParamSchema,
    slugParam: apiRouteParams.slugParamSchema,
    
    // Query params
    paginationParams: apiQueryParams.paginationParamsSchema,
    sortParams: apiQueryParams.sortParamsSchema,
    searchParams: apiQueryParams.searchParamsSchema,
    dateRangeParams: apiQueryParams.dateRangeParamsSchema,
    taskFilterParams: apiQueryParams.taskFilterParamsSchema,
    taskQueryParams: apiQueryParams.taskQueryParamsSchema,
    
    // Log entry
    clientLogBatch: apiLogEntry.clientLogBatchSchema,
    clientLogEntry: apiLogEntry.clientLogEntrySchema,
    
    // Analytics responses
    webVitalResponse: apiAnalyticsResponses.webVitalsResponseSchema,
    errorResponse: apiAnalyticsResponses.errorsResponseSchema,
    
    // Task responses
    taskResponse: apiTasksResponses.taskResponseSchema,
    tasksResponse: apiTasksResponses.tasksResponseSchema,
  },
  
  errors: {
    uiError: uiError.uiErrorSchema,
  },
  
  pages: {
    authPathParam: serverComponentProps.authPathParamSchema,
    tasksSearchParams: serverComponentProps.tasksSearchParamsSchema,
  },
} as const;

/**
 * Type-safe registry type
 */
export type SchemaRegistry = typeof schemaRegistry;

/**
 * Get schema by path
 * 
 * @example
 * ```ts
 * const taskSchema = getSchema("entities.task");
 * const createTaskSchema = getSchema("operations.createTask");
 * ```
 */
export function getSchema(path: string): z.ZodTypeAny | undefined {
  const parts = path.split(".");
  let current: any = schemaRegistry;
  
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current as z.ZodTypeAny | undefined;
}

/**
 * List all schema paths
 */
export function listSchemaPaths(): string[] {
  const paths: string[] = [];
  
  function traverse(obj: any, prefix: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      if (key === "version") continue;
      
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === "object" && "parse" in value) {
        // It's a Zod schema
        paths.push(currentPath);
      } else if (value && typeof value === "object") {
        // It's a nested object, recurse
        traverse(value, currentPath);
      }
    }
  }
  
  traverse(schemaRegistry);
  return paths;
}

/**
 * Get schema metadata
 */
export interface SchemaMetadata {
  path: string;
  name: string;
  category: string;
  schema: z.ZodTypeAny;
}

/**
 * Get all schemas with metadata
 */
export function getAllSchemas(): SchemaMetadata[] {
  const schemas: SchemaMetadata[] = [];
  
  function traverse(obj: any, prefix: string = "", category: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      if (key === "version") continue;
      
      const currentPath = prefix ? `${prefix}.${key}` : key;
      const currentCategory = category || key;
      
      if (value && typeof value === "object" && "parse" in value) {
        // It's a Zod schema
        schemas.push({
          path: currentPath,
          name: key,
          category: currentCategory,
          schema: value as z.ZodTypeAny,
        });
      } else if (value && typeof value === "object") {
        // It's a nested object, recurse
        traverse(value, currentPath, currentCategory);
      }
    }
  }
  
  traverse(schemaRegistry);
  return schemas;
}
