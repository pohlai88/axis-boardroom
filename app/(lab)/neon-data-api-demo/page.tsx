/**
 * Neon Data API Demo Page
 * 
 * Demonstrates client-side and server-side Neon Data API usage.
 * 
 * Visit: http://localhost:3000/neon-data-api-demo
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TestResult {
  success: boolean
  configured?: boolean
  message?: string
  test?: {
    query: string
    rows: number
    data: unknown[]
  }
  error?: string
  timestamp?: string
  instructions?: string[]
}

export default function NeonDataApiDemoPage() {
  const [serverTestResult, setServerTestResult] = useState<TestResult | null>(null)
  const [clientTestResult, setClientTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testServerDataApi = async () => {
    setLoading(true)
    setServerTestResult(null)
    
    try {
      const response = await fetch('/api/neon-data-api/test')
      const data = await response.json()
      setServerTestResult(data)
    } catch (error) {
      setServerTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const testClientDataApi = async () => {
    setLoading(true)
    setClientTestResult(null)
    
    try {
      // Check if Data API URL is configured
      const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL
      
      if (!dataApiUrl) {
        setClientTestResult({
          success: false,
          configured: false,
          message: 'NEXT_PUBLIC_NEON_DATA_API_URL is not configured',
          instructions: [
            '1. Go to Neon Console > Project Settings > Data API',
            '2. Copy the Data API URL',
            '3. Add NEXT_PUBLIC_NEON_DATA_API_URL to your .env.local',
          ],
        })
        setLoading(false)
        return
      }

      // Import and use Data API client
      const { neonDataApi } = await import('@/lib/client/neon/data-api')
      
      // Create client instance and execute query
      const client = neonDataApi()
      const result = await client.query('SELECT 1 as test, NOW() as timestamp')
      
      setClientTestResult({
        success: true,
        configured: true,
        message: 'Client-side Data API is working!',
        test: {
          query: 'SELECT 1 as test, NOW() as timestamp',
          rows: result.rows,
          data: result.data,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setClientTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Neon Data API Demo</h1>
          <p className="text-muted-foreground">
            Test and demonstrate Neon Data API functionality for client-side and server-side queries.
          </p>
        </div>

        {/* Server-Side Test */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Server-Side Data API Test</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tests Data API from an API route (server-side)
              </p>
            </div>
            
            <Button 
              onClick={testServerDataApi} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Server-Side Data API'}
            </Button>

            {serverTestResult && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {serverTestResult.success ? (
                      <span className="text-green-600 dark:text-green-400">✅</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">❌</span>
                    )}
                    <span className="font-medium">{serverTestResult.message || 'Test completed'}</span>
                  </div>
                  
                  {serverTestResult.test && (
                    <div className="mt-2 text-sm">
                      <p>Rows: {serverTestResult.test.rows}</p>
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                        {JSON.stringify(serverTestResult.test.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {serverTestResult.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      <p>Error: {serverTestResult.error}</p>
                    </div>
                  )}
                  
                  {serverTestResult.instructions && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium mb-1">Setup Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {serverTestResult.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {serverTestResult.timestamp && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tested at: {new Date(serverTestResult.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Client-Side Test */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Client-Side Data API Test</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tests Data API directly from the browser (client-side)
              </p>
            </div>
            
            <Button 
              onClick={testClientDataApi} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Client-Side Data API'}
            </Button>

            {clientTestResult && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {clientTestResult.success ? (
                      <span className="text-green-600 dark:text-green-400">✅</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">❌</span>
                    )}
                    <span className="font-medium">{clientTestResult.message || 'Test completed'}</span>
                  </div>
                  
                  {clientTestResult.test && (
                    <div className="mt-2 text-sm">
                      <p>Rows: {clientTestResult.test.rows}</p>
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                        {JSON.stringify(clientTestResult.test.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {clientTestResult.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      <p>Error: {clientTestResult.error}</p>
                    </div>
                  )}
                  
                  {clientTestResult.instructions && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium mb-1">Setup Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {clientTestResult.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {clientTestResult.timestamp && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tested at: {new Date(clientTestResult.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Documentation Links */}
        <Card className="p-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://neon.com/docs/data-api/overview" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Neon Data API Overview
                </a>
              </li>
              <li>
                <a 
                  href="/docs/NEON_DATA_API_OPTIMIZATION.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Data API Optimization Guide (Local)
                </a>
              </li>
              <li>
                <a 
                  href="/docs/NEON_DATA_API_QUICKSTART.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Quick Start Guide (Local)
                </a>
              </li>
            </ul>
          </div>
        </Card>

        {/* Info Box */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> This demo requires{' '}
            <code className="text-xs">NEXT_PUBLIC_NEON_DATA_API_URL</code> to be set in your environment variables.
            Get it from Neon Console &gt; Project Settings &gt; Data API.
          </p>
        </div>
      </div>
    </main>
  )
}
