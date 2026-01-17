/**
 * Neon MCP API Endpoint
 * 
 * Provides API endpoints for Neon MCP-related operations.
 * These endpoints complement MCP tools available to AI assistants.
 * 
 * Routes:
 * - GET /api/neon/mcp - Get MCP tool reference and project info
 * - GET /api/neon/mcp/slow-queries - List slow queries
 * - GET /api/neon/mcp/tables - List database tables
 * - GET /api/neon/mcp/tables/[table] - Describe table schema
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getProjectInfo,
  listSlowQueries,
  getDatabaseTables,
  describeTableSchema,
  getMCPToolReference,
  isMCPAvailable,
} from '@/lib/server/neon/mcp-integration'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('api.neon.mcp')

/**
 * GET /api/neon/mcp
 * 
 * Get MCP tool reference and project information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Handle different actions
    switch (action) {
      case 'info':
        const projectInfo = await getProjectInfo()
        const mcpReference = getMCPToolReference()
        
        return NextResponse.json({
          success: true,
          project: projectInfo,
          mcp: mcpReference,
        })

      case 'slow-queries': {
        const limit = parseInt(searchParams.get('limit') || '10')
        const minExecutionTime = parseInt(searchParams.get('minExecutionTime') || '100')
        
        const slowQueries = await listSlowQueries({ limit, minExecutionTime })
        
        return NextResponse.json({
          success: true,
          queries: slowQueries,
          count: slowQueries.length,
        })
      }

      case 'tables': {
        const schema = searchParams.get('schema') || undefined
        const tableName = searchParams.get('table')
        
        if (tableName) {
          // Describe specific table
          const schemaInfo = await describeTableSchema(tableName, schema)
          
          return NextResponse.json({
            success: true,
            table: tableName,
            schema: schema || 'public',
            columns: schemaInfo,
          })
        } else {
          // List all tables
          const tables = await getDatabaseTables(schema)
          
          return NextResponse.json({
            success: true,
            tables,
            count: tables.length,
          })
        }
      }

      case 'reference':
        return NextResponse.json({
          success: true,
          ...getMCPToolReference(),
        })

      default:
        // Default: return project info and MCP reference
        const defaultProjectInfo = await getProjectInfo()
        const defaultMCPReference = getMCPToolReference()
        
        return NextResponse.json({
          success: true,
          available: isMCPAvailable(),
          project: defaultProjectInfo,
          mcp: defaultMCPReference,
          endpoints: {
            info: '/api/neon/mcp?action=info',
            slowQueries: '/api/neon/mcp?action=slow-queries&limit=10',
            tables: '/api/neon/mcp?action=tables',
            tableSchema: '/api/neon/mcp?action=tables&table=TABLE_NAME',
            reference: '/api/neon/mcp?action=reference',
          },
        })
    }
  } catch (error) {
    logger.error({ error }, 'MCP API error')
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
