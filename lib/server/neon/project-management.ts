/**
 * Neon Project Management Utilities
 * 
 * Utilities for managing Neon projects in a project-per-user multitenancy model.
 * 
 * Reference: https://neon.com/docs/guides/multitenancy
 * 
 * Note: This is a reference implementation for future migration to project-per-user.
 * Your current architecture uses shared schema with RLS, which is suitable for
 * your current scale. Use this when you're ready to migrate to project-per-user.
 * 
 * Usage:
 * ```ts
 * import { createTenantProject, getTenantConnectionString } from '@/lib/server/neon/project-management'
 * 
 * // Create project for new tenant
 * const project = await createTenantProject(orgId, 'us-east-1')
 * 
 * // Get connection string for tenant
 * const connectionString = await getTenantConnectionString(orgId)
 * ```
 */

import { env } from '@/lib/core/env'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('neon.projects')

// Neon API client (install @neondatabase/api when needed)
// import { NeonApi } from '@neondatabase/api'

/**
 * Create a Neon project for a tenant
 * 
 * This creates a dedicated Neon project (database) for a tenant organization.
 * Each project provides complete data isolation.
 * 
 * @param orgId Organization ID
 * @param region AWS region (default: us-east-1)
 * @returns Neon project information
 */
export async function createTenantProject(
  orgId: string,
  region = 'us-east-1'
): Promise<{
  id: string
  name: string
  connectionString: string
}> {
  logger.info({ orgId, region }, 'Creating tenant project')

  // TODO: Install @neondatabase/api and implement
  // const neonApi = new NeonApi({ apiKey: env.NEON_API_KEY })
  // 
  // const project = await neonApi.projects.create({
  //   name: `org-${orgId}`,
  //   region,
  //   pgVersion: 17,
  // })
  // 
  // return {
  //   id: project.id,
  //   name: project.name,
  //   connectionString: project.connectionString,
  // }

  throw new Error(
    'Neon API integration not yet implemented. ' +
    'Install @neondatabase/api and configure NEON_API_KEY to use project-per-user.'
  )
}

/**
 * Get connection string for a tenant's project
 * 
 * @param orgId Organization ID
 * @returns Connection string for tenant's project
 */
export async function getTenantConnectionString(orgId: string): Promise<string> {
  logger.info({ orgId }, 'Getting tenant connection string')

  // TODO: Query organization table for neonProjectId
  // const org = await db.select()
  //   .from(organizations)
  //   .where(eq(organizations.id, orgId))
  //   .limit(1)
  // 
  // if (!org[0]?.neonProjectId) {
  //   throw new Error('Project not found for organization')
  // }
  // 
  // const neonApi = new NeonApi({ apiKey: env.NEON_API_KEY })
  // const connectionString = await neonApi.connectionStrings.get({
  //   projectId: org[0].neonProjectId,
  // })
  // 
  // return connectionString

  throw new Error(
    'Neon API integration not yet implemented. ' +
    'This is a reference implementation for future project-per-user migration.'
  )
}

/**
 * Delete a tenant's project
 * 
 * Use with caution - this permanently deletes the project and all data.
 * 
 * @param orgId Organization ID
 */
export async function deleteTenantProject(orgId: string): Promise<void> {
  logger.warn({ orgId }, 'Deleting tenant project')

  // TODO: Implement project deletion
  // const org = await db.select()
  //   .from(organizations)
  //   .where(eq(organizations.id, orgId))
  //   .limit(1)
  // 
  // if (!org[0]?.neonProjectId) {
  //   throw new Error('Project not found for organization')
  // }
  // 
  // const neonApi = new NeonApi({ apiKey: env.NEON_API_KEY })
  // await neonApi.projects.delete({ projectId: org[0].neonProjectId })

  throw new Error('Not implemented - reference only')
}

/**
 * Check if project-per-user is enabled
 * 
 * @returns True if using project-per-user architecture
 */
export function isProjectPerUserEnabled(): boolean {
  return !!env.NEON_API_KEY && process.env.ENABLE_PROJECT_PER_USER === 'true'
}

/**
 * Get project ID for an organization
 * 
 * @param orgId Organization ID
 * @returns Project ID or null
 * 
 * Note: This is a reference implementation for future project-per-user migration.
 * Currently returns null as the shared schema approach doesn't use project-per-user.
 */
export async function getTenantProjectId(orgId: string): Promise<string | null> {
  // Reference implementation for future use:
  // When migrating to project-per-user, uncomment and implement:
  //
  // import { db } from '@/lib/server/drizzle'
  // import { organizations } from '@/lib/server/drizzle/schema-multitenant'
  // import { eq } from 'drizzle-orm'
  //
  // const org = await db.select()
  //   .from(organizations)
  //   .where(eq(organizations.id, orgId))
  //   .limit(1)
  //
  // return org[0]?.neonProjectId || null

  // Current implementation: shared schema doesn't use project-per-user
  return null
}
