/**
 * Neon MCP Demo Page
 * 
 * Interactive demo page for testing Neon MCP integration utilities.
 * This page demonstrates MCP tools available to AI assistants and
 * application-level utilities.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/_internal/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/_internal/ui/card'

interface ProjectInfo {
  id: string
  name: string
  region: string
  pgVersion: string
  status: string
}

interface SlowQuery {
  query: string
  calls: number
  total_exec_time_ms: number
  mean_exec_time_ms: number
  rows: number
}

interface TableInfo {
  schema: string
  name: string
  type: string
}

export default function NeonMCPDemoPage() {
  const [loading, setLoading] = useState(false)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([])
  const [tables, setTables] = useState<TableInfo[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchProjectInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/neon/mcp?action=info')
      const data = await response.json()
      if (data.success && data.project) {
        setProjectInfo(data.project)
      } else {
        setError(data.error || 'Failed to fetch project info')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlowQueries = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/neon/mcp?action=slow-queries&limit=10')
      const data = await response.json()
      if (data.success) {
        setSlowQueries(data.queries || [])
      } else {
        setError(data.error || 'Failed to fetch slow queries')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/neon/mcp?action=tables')
      const data = await response.json()
      if (data.success) {
        setTables(data.tables || [])
      } else {
        setError(data.error || 'Failed to fetch tables')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Neon MCP Integration Demo</h1>
        <p className="text-muted-foreground">
          Test Neon MCP integration utilities and API endpoints
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Get Neon project details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchProjectInfo}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Get Project Info'}
            </Button>
            {projectInfo && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {projectInfo.id}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {projectInfo.name}
                </div>
                <div>
                  <span className="font-medium">Region:</span> {projectInfo.region}
                </div>
                <div>
                  <span className="font-medium">PostgreSQL:</span> {projectInfo.pgVersion}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={projectInfo.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                    {projectInfo.status}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slow Queries</CardTitle>
            <CardDescription>Monitor query performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchSlowQueries}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Get Slow Queries'}
            </Button>
            {slowQueries.length > 0 && (
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  Found {slowQueries.length} slow queries
                </div>
                {slowQueries.slice(0, 3).map((query, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded">
                    <div className="font-medium">
                      {query.mean_exec_time_ms.toFixed(2)}ms avg
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {query.query.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>List all database tables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchTables}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Get Tables'}
            </Button>
            {tables.length > 0 && (
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                <div className="font-medium">
                  Found {tables.length} tables
                </div>
                {tables.slice(0, 10).map((table, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded">
                    <div className="font-medium">{table.schema}.{table.name}</div>
                    <div className="text-xs text-muted-foreground">{table.type}</div>
                  </div>
                ))}
                {tables.length > 10 && (
                  <div className="text-xs text-muted-foreground">
                    ... and {tables.length - 10} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MCP Tools Reference</CardTitle>
          <CardDescription>
            MCP tools available to AI assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Database Operations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>mcp_Neon_run_sql - Execute SQL queries</li>
                <li>mcp_Neon_list_slow_queries - Monitor performance</li>
                <li>mcp_Neon_explain_sql_statement - Query plan analysis</li>
                <li>mcp_Neon_prepare_query_tuning - Query optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Branch Management</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>mcp_Neon_create_branch - Create development branches</li>
                <li>mcp_Neon_delete_branch - Delete branches</li>
                <li>mcp_Neon_describe_branch - Branch information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Migration Management</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>mcp_Neon_prepare_database_migration - Prepare migrations</li>
                <li>mcp_Neon_complete_database_migration - Apply migrations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Schema Operations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>mcp_Neon_get_database_tables - List tables</li>
                <li>mcp_Neon_describe_table_schema - Table schema details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <a
                href="/docs/NEON_MCP_INTEGRATION.md"
                className="text-primary hover:underline"
              >
                Neon MCP Integration Guide
              </a>
            </div>
            <div>
              <a
                href="https://neon.tech/docs/develop/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Neon MCP Official Documentation
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
