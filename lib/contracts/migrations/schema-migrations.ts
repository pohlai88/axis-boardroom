/**
 * Schema Migrations
 * 
 * Handles schema versioning and backwards-compatible migrations.
 * Tracks schema versions and provides migration paths for breaking changes.
 */

import { z } from "zod";

/**
 * Schema version metadata
 */
export interface SchemaVersion {
  version: string;
  schema: z.ZodTypeAny;
  migration?: (data: unknown) => unknown;
  breaking?: boolean;
}

/**
 * Versioned schema registry
 */
export const versionedSchemas: Record<string, SchemaVersion[]> = {};

/**
 * Register a schema version
 * 
 * @example
 * ```ts
 * registerSchemaVersion("task", {
 *   version: "1.0.0",
 *   schema: taskSchemaV1,
 * });
 * 
 * registerSchemaVersion("task", {
 *   version: "2.0.0",
 *   schema: taskSchemaV2,
 *   migration: (v1) => ({ ...v1, newField: "default" }),
 *   breaking: false, // Additive change
 * });
 * ```
 */
export function registerSchemaVersion(
  schemaName: string,
  version: SchemaVersion
): void {
  if (!versionedSchemas[schemaName]) {
    versionedSchemas[schemaName] = [];
  }
  
  versionedSchemas[schemaName].push(version);
  
  // Sort by version (semver)
  versionedSchemas[schemaName].sort((a, b) => {
    return a.version.localeCompare(b.version);
  });
}

/**
 * Get latest schema version
 */
export function getLatestSchema(schemaName: string): z.ZodTypeAny | undefined {
  const versions = versionedSchemas[schemaName];
  if (!versions || versions.length === 0) {
    return undefined;
  }
  
  return versions[versions.length - 1].schema;
}

/**
 * Migrate data from one version to another
 */
export function migrateSchema(
  schemaName: string,
  fromVersion: string,
  toVersion: string,
  data: unknown
): unknown {
  const versions = versionedSchemas[schemaName];
  if (!versions) {
    throw new Error(`Schema ${schemaName} not found in version registry`);
  }
  
  const fromIndex = versions.findIndex(v => v.version === fromVersion);
  const toIndex = versions.findIndex(v => v.version === toVersion);
  
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`Version not found for schema ${schemaName}`);
  }
  
  if (fromIndex === toIndex) {
    return data; // No migration needed
  }
  
  let currentData = data;
  
  // Migrate forward
  if (fromIndex < toIndex) {
    for (let i = fromIndex + 1; i <= toIndex; i++) {
      const version = versions[i];
      if (version.migration) {
        currentData = version.migration(currentData);
      } else if (version.breaking) {
        throw new Error(
          `Breaking change in ${schemaName} v${version.version} requires manual migration`
        );
      }
    }
  } else {
    // Migrate backward (not recommended, but supported)
    for (let i = fromIndex - 1; i >= toIndex; i--) {
      // Backward migrations not implemented by default
      // Would need reverse migration functions
      throw new Error(`Backward migration not supported for ${schemaName}`);
    }
  }
  
  return currentData;
}

/**
 * Example: Task schema versioning
 * 
 * This demonstrates the pattern for versioning schemas
 */

// v1 schema (example - not actually used yet)
export const taskSchemaV1 = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["todo", "done"]),
});

// v2 schema (additive change - backwards compatible)
export const taskSchemaV2 = taskSchemaV1.extend({
  priority: z.enum(["low", "medium", "high"]).optional(),
  type: z.enum(["bug", "feature", "documentation"]).optional(),
});

// Migration function v1 -> v2
function migrateTaskV1toV2(v1: z.infer<typeof taskSchemaV1>): z.infer<typeof taskSchemaV2> {
  return {
    ...v1,
    priority: "medium" as const, // Default value
    type: "feature" as const, // Default value
  };
}

/**
 * Initialize versioned schemas (example)
 * 
 * Uncomment and customize when you need versioning:
 */
/*
registerSchemaVersion("task", {
  version: "1.0.0",
  schema: taskSchemaV1,
});

registerSchemaVersion("task", {
  version: "2.0.0",
  schema: taskSchemaV2,
  migration: migrateTaskV1toV2,
  breaking: false, // Additive change
});
*/
