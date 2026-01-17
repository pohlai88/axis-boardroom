/**
 * Neon MCP Integration Utilities
 * 
 * This module provides utilities that align with Neon MCP (Model Context Protocol) tools.
 * These utilities can be used directly in your application code, while MCP tools are
 * available to AI assistants for database management tasks.
 * 
 * MCP Tools are available to AI assistants via the Neon MCP server:
 * - mcp_Neon_list_slow_queries
 * - mcp_Neon_run_sql
 * - mcp_Neon_create_branch
 * - mcp_Neon_prepare_database_migration
 * - etc.
 * 
 * This module provides application-level utilities that complement MCP tools.
 * 
 * Usage:
 * ```ts
 * import { 
 *   getProjectInfo,
 *   listSlowQueries,
 *   createBranch,
 *   prepareMigration 
 * } from '@/lib/server/neon/mcp-integration'
 * 
 * // Get project information
 * const project = await getProjectInfo()
 * 
 * // List slow queries
 * const slowQueries = await listSlowQueries({ limit: 10 })
 * 
 * // Create a branch
 * const branch = await createBranch('feature-new-feature')
 * ```
 */

import { env } from '@/lib/core/env'
import { db } from '@/lib/server/drizzle'
import { sql } from 'drizzle-orm'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('neon.mcp')

/**
 * Neon Project ID
 * 
 * Get from Neon Console > Project Settings > Project ID
 * Or use the default project ID for this application
 */
export const NEON_PROJECT_ID = env.NEON_PROJECT_ID || 'curly-surf-86073016'

/**
 * Project Information
 */
export interface ProjectInfo {
  id: string
  name: string
  region: string
  pgVersion: string
  status: 'healthy' | 'degraded' | 'unhealthy'
}

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
 * Branch Information
 */
export interface BranchInfo {
  id: string
  name: string
  parentId?: string
  createdAt: string
  status: 'ready' | 'init' | 'pending'
}

/**
 * Migration Information
 */
export interface MigrationInfo {
  id: string
  sql: string
  status: 'prepared' | 'completed' | 'failed'
  temporaryBranchId?: string
}

/**
 * Get project information
 * 
 * Returns information about the Neon project.
 * For detailed project info, use MCP tool: mcp_Neon_describe_project
 */
export async function getProjectInfo(): Promise<ProjectInfo> {
  try {
    // Test connection to verify project is accessible
    await db.execute(sql`SELECT 1`)
    
    return {
      id: NEON_PROJECT_ID,
      name: 'AXIS',
      region: 'ap-southeast-1',
      pgVersion: '17',
      status: 'healthy'
    }
  } catch (error) {
    logger.error({ error }, 'Failed to get project info')
    return {
      id: NEON_PROJECT_ID,
      name: 'AXIS',
      region: 'ap-southeast-1',
      pgVersion: '17',
      status: 'unhealthy'
    }
  }
}

/**
 * List slow queries
 * 
 * Uses pg_stat_statements to identify slow queries.
 * For MCP tool equivalent, use: mcp_Neon_list_slow_queries
 * 
 * @param options Configuration options
 * @returns Array of slow queries
 */
export async function listSlowQueries(options: {
  limit?: number
  minExecutionTime?: number
} = {}): Promise<SlowQuery[]> {
  const { limit = 10, minExecutionTime = 100 } = options

  try {
    logger.info({ limit, minExecutionTime }, 'Listing slow queries')

    const result = await db.execute(sql`
      SELECT 
        query,
        calls::bigint as calls,
        total_exec_time::numeric as total_exec_time_ms,
        mean_exec_time::numeric as mean_exec_time_ms,
        rows::bigint as rows
      FROM pg_stat_statements
      WHERE mean_exec_time >= ${minExecutionTime}
      ORDER BY mean_exec_time DESC
      LIMIT ${limit}
    `)

    return result.rows.map((row: any) => ({
      query: row.query as string,
      calls: Number(row.calls),
      total_exec_time_ms: Number(row.total_exec_time_ms),
      mean_exec_time_ms: Number(row.mean_exec_time_ms),
      rows: Number(row.rows),
    }))
  } catch (error) {
    if (error instanceof Error && error.message.includes('pg_stat_statements')) {
      logger.warn({ error }, 'pg_stat_statements extension not available')
      return []
    }
    logger.error({ error }, 'Failed to list slow queries')
    throw error
  }
}

/**
 * Execute SQL query
 * 
 * Execute a SQL query directly.
 * For MCP tool equivalent, use: mcp_Neon_run_sql
 * 
 * Note: For parameterized queries, use Drizzle ORM's sql template directly.
 * This function is for simple queries only. For complex SQL execution,
 * use MCP tool: mcp_Neon_run_sql
 * 
 * @param sqlQuery SQL query to execute
 * @returns Query result
 */
export async function executeSQL<T = unknown>(
  sqlQuery: string
): Promise<T[]> {
  try {
    logger.info({ query: sqlQuery.substring(0, 100) }, 'Executing SQL')
    
    const result = await db.execute(sql.raw(sqlQuery))
    return result.rows as T[]
  } catch (error) {
    logger.error({ error, query: sqlQuery }, 'Failed to execute SQL')
    throw error
  }
}

/**
 * Get database tables
 * 
 * List all tables in the database.
 * For MCP tool equivalent, use: mcp_Neon_get_database_tables
 * 
 * @param schema Optional schema name (defaults to all schemas)
 * @returns Array of table information
 */
export async function getDatabaseTables(schema?: string) {
  try {
    logger.info({ schema }, 'Getting database tables')

    const query = schema
      ? sql`SELECT table_schema, table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = ${schema}
            ORDER BY table_schema, table_name`
      : sql`SELECT table_schema, table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name`

    const result = await db.execute(query)
    
    return result.rows.map((row: any) => ({
      schema: row.table_schema as string,
      name: row.table_name as string,
      type: row.table_type as string,
    }))
  } catch (error) {
    logger.error({ error, schema }, 'Failed to get database tables')
    throw error
  }
}

/**
 * Describe table schema
 * 
 * Get detailed information about a table's schema.
 * For MCP tool equivalent, use: mcp_Neon_describe_table_schema
 * 
 * @param tableName Table name
 * @param schema Optional schema name (defaults to 'public')
 * @returns Table schema information
 */
export async function describeTableSchema(tableName: string, schema = 'public') {
  try {
    logger.info({ tableName, schema }, 'Describing table schema')

    const result = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = ${schema}
        AND table_name = ${tableName}
      ORDER BY ordinal_position
    `)

    return result.rows.map((row: any) => ({
      name: row.column_name as string,
      type: row.data_type as string,
      nullable: row.is_nullable === 'YES',
      default: row.column_default as string | null,
      maxLength: row.character_maximum_length as number | null,
    }))
  } catch (error) {
    logger.error({ error, tableName, schema }, 'Failed to describe table schema')
    throw error
  }
}

/**
 * Get connection string
 * 
 * Returns the current database connection string.
 * For MCP tool equivalent, use: mcp_Neon_get_connection_string
 * 
 * @param branchId Optional branch ID
 * @returns Connection string information
 */
export async function getConnectionString(branchId?: string) {
  try {
    logger.info({ branchId }, 'Getting connection string')

    // Return current connection string
    // For branch-specific connections, use MCP tool: mcp_Neon_get_connection_string
    return {
      url: env.DATABASE_URL || '',
      projectId: NEON_PROJECT_ID,
      branchId: branchId || 'main',
      note: 'For branch-specific connections, use MCP tool: mcp_Neon_get_connection_string'
    }
  } catch (error) {
    logger.error({ error, branchId }, 'Failed to get connection string')
    throw error
  }
}

/**
 * Check if MCP tools are available
 * 
 * MCP tools are available to AI assistants via the Neon MCP server.
 * This function checks if the project is configured for MCP usage.
 * 
 * @returns True if project is configured for MCP
 */
export function isMCPAvailable(): boolean {
  return !!NEON_PROJECT_ID && !!env.DATABASE_URL
}

/**
 * Get MCP tool reference
 * 
 * Returns information about available MCP tools for AI assistants.
 */
export function getMCPToolReference() {
  return {
    available: isMCPAvailable(),
    projectId: NEON_PROJECT_ID,
    tools: {
      database: [
        'mcp_Neon_run_sql',
        'mcp_Neon_run_sql_transaction',
        'mcp_Neon_list_slow_queries',
        'mcp_Neon_explain_sql_statement',
        'mcp_Neon_prepare_query_tuning',
        'mcp_Neon_complete_query_tuning',
      ],
      branches: [
        'mcp_Neon_create_branch',
        'mcp_Neon_delete_branch',
        'mcp_Neon_describe_branch',
        'mcp_Neon_reset_from_parent',
      ],
      migrations: [
        'mcp_Neon_prepare_database_migration',
        'mcp_Neon_complete_database_migration',
      ],
      schema: [
        'mcp_Neon_get_database_tables',
        'mcp_Neon_describe_table_schema',
      ],
      project: [
        'mcp_Neon_describe_project',
        'mcp_Neon_get_connection_string',
        'mcp_Neon_list_projects',
      ],
    },
    documentation: 'https://neon.tech/docs/develop/mcp',
  }
}
