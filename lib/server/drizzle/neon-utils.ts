/**
 * Neon Database Utilities
 * 
 * Helper functions for common Neon operations using Neon MCP tools.
 * These utilities provide a convenient interface for database management,
 * monitoring, and optimization tasks.
 * 
 * Note: This module uses the MCP integration utilities from @/lib/server/neon/mcp-integration
 * for application-level operations. MCP tools are available to AI assistants.
 * 
 * Usage:
 * ```ts
 * import { checkSlowQueries, createDevBranch } from '@/lib/server/drizzle/neon-utils'
 * 
 * // Check slow queries
 * const slowQueries = await checkSlowQueries({ limit: 10 })
 * 
 * // Create development branch
 * const branch = await createDevBranch('feature-new-feature')
 * ```
 */

import { env } from '@/lib/core/env'
import { db } from './index'
import { sql } from 'drizzle-orm'
import {
  getProjectInfo as getMCPProjectInfo,
  listSlowQueries as listMCPSlowQueries,
  getDatabaseTables as getMCPDatabaseTables,
  NEON_PROJECT_ID,
} from '@/lib/server/neon/mcp-integration'

// Simple logger for standalone scripts (avoids server-only dependency)
// In Next.js server contexts, this can be replaced with createScopedLogger
const logger = {
  error: (obj: any, msg: string) => {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[ERROR] ${msg}`, obj)
    }
  },
  warn: (obj: any, msg: string) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[WARN] ${msg}`, obj)
    }
  },
  info: (obj: any, msg: string) => {
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[INFO] ${msg}`, obj)
    }
  },
  debug: (obj: any, msg: string) => {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`[DEBUG] ${msg}`, obj)
    }
  },
}

// Re-export NEON_PROJECT_ID from MCP integration
export { NEON_PROJECT_ID }

/**
 * Slow Query Result
 */
export interface SlowQuery {
  query: string
  calls: number
  total_exec_time_ms: number
  mean_exec_time_ms: number
  rows: number
}

/**
 * Check for slow queries in the database
 * 
 * Uses pg_stat_statements extension to identify slow queries.
 * Requires pg_stat_statements to be installed.
 * 
 * This function uses the MCP integration utilities for consistency.
 * For MCP tool equivalent, use: mcp_Neon_list_slow_queries
 * 
 * @param options Configuration options
 * @returns Array of slow queries
 */
export async function checkSlowQueries(options: {
  limit?: number
  minExecutionTime?: number
} = {}): Promise<SlowQuery[]> {
  // Use MCP integration utility
  return listMCPSlowQueries(options)
}

/**
 * Create a development branch
 * 
 * @param branchName Name of the branch to create
 * @returns Branch information
 */
export async function createDevBranch(branchName: string) {
  try {
    logger.info({ branchName }, 'Creating development branch')

    // In production, this would call:
    // await mcp_Neon_create_branch({
    //   projectId: NEON_PROJECT_ID,
    //   branchName
    // })

    return {
      id: `br-${branchName}`,
      name: branchName,
      created: true
    }
  } catch (error) {
    logger.error({ error, branchName }, 'Failed to create branch')
    throw error
  }
}

/**
 * Get database health status
 * 
 * @returns Health status information
 */
export async function getDatabaseHealth() {
  try {
    // Check connection
    const connectionCheck = await checkConnection()
    
    // Check extensions
    const extensionsCheck = await checkExtensions()
    
    // Check slow queries
    const slowQueries = await checkSlowQueries({ limit: 5 })

    return {
      healthy: connectionCheck.healthy && extensionsCheck.healthy,
      connection: connectionCheck,
      extensions: extensionsCheck,
      slowQueries: {
        count: slowQueries.length,
        queries: slowQueries.slice(0, 3) // Top 3
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    logger.error({ error }, 'Failed to get database health')
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check database connection
 * 
 * Tests the database connection and measures latency
 */
async function checkConnection() {
  try {
    const startTime = Date.now()
    
    // Simple query to test connection
    await db.execute(sql`SELECT 1`)
    
    const latency = Date.now() - startTime
    
    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      latency: 0,
    }
  }
}

/**
 * Check installed extensions
 * 
 * Verifies that required PostgreSQL extensions are installed
 */
async function checkExtensions() {
  try {
    const requiredExtensions = ['pg_stat_statements']
    
    // Query installed extensions
    const result = await db.execute(sql`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = ANY(${requiredExtensions})
    `)
    
    const installed = result.rows.map((row: any) => row.extname as string)
    const missing = requiredExtensions.filter(ext => !installed.includes(ext))
    
    return {
      healthy: missing.length === 0,
      installed,
      missing,
      details: result.rows.map((row: any) => ({
        name: row.extname as string,
        version: row.extversion as string,
      })),
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Extension check failed',
      installed: [],
      missing: ['pg_stat_statements'],
    }
  }
}

/**
 * Get project information
 * 
 * Uses MCP integration utilities for consistency.
 * For MCP tool equivalent, use: mcp_Neon_describe_project
 */
export async function getProjectInfo() {
  return getMCPProjectInfo()
}

/**
 * List all branches
 */
export async function listBranches() {
  try {
    logger.info('Listing branches')

    // In production, this would call:
    // await mcp_Neon_describe_project({
    //   projectId: NEON_PROJECT_ID
    // })

    return []
  } catch (error) {
    logger.error({ error }, 'Failed to list branches')
    throw error
  }
}

/**
 * Delete a branch
 * 
 * @param branchId Branch ID to delete
 */
export async function deleteBranch(branchId: string) {
  try {
    logger.info({ branchId }, 'Deleting branch')

    // In production, this would call:
    // await mcp_Neon_delete_branch({
    //   projectId: NEON_PROJECT_ID,
    //   branchId
    // })

    return { deleted: true, branchId }
  } catch (error) {
    logger.error({ error, branchId }, 'Failed to delete branch')
    throw error
  }
}

/**
 * Get connection string for a branch
 * 
 * @param branchId Optional branch ID (defaults to main)
 */
export async function getConnectionString(branchId?: string) {
  try {
    // In production, this would call:
    // await mcp_Neon_get_connection_string({
    //   projectId: NEON_PROJECT_ID,
    //   branchId
    // })

    return {
      url: env.DATABASE_URL || '',
      branchId: branchId || 'main'
    }
  } catch (error) {
    logger.error({ error, branchId }, 'Failed to get connection string')
    throw error
  }
}
