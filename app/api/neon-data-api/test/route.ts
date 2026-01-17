/**
 * Neon Data API Test Endpoint
 * 
 * Tests the Neon Data API connection and returns status.
 * 
 * GET /api/neon-data-api/test
 */

import { NextResponse } from 'next/server'
import { isDataApiConfigured, executeDataApiQuery } from '@/lib/server/neon/data-api'

export async function GET() {
  try {
    // Check if Data API is configured
    const isConfigured = isDataApiConfigured()
    
    if (!isConfigured) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message: 'Neon Data API is not configured. Set NEXT_PUBLIC_NEON_DATA_API_URL in your environment variables.',
          instructions: [
            '1. Go to Neon Console > Project Settings > Data API',
            '2. Copy the Data API URL',
            '3. Add NEXT_PUBLIC_NEON_DATA_API_URL to your .env.local',
            '4. Optionally add NEON_DATA_API_KEY for server-side authentication',
          ],
        },
        { status: 200 }
      )
    }

    // Test query - simple SELECT 1
    const testQuery = 'SELECT 1 as test, NOW() as timestamp, version() as pg_version'
    
    try {
      const result = await executeDataApiQuery(testQuery)
      
      return NextResponse.json({
        success: true,
        configured: true,
        message: 'Neon Data API is working correctly!',
        test: {
          query: testQuery,
          rows: result.rows,
          data: result.data,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (queryError) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          message: 'Data API is configured but query failed',
          error: queryError instanceof Error ? queryError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
