/**
 * Database Health Check Route Handler
 * 
 * Enhanced health check endpoint for database monitoring.
 * Provides detailed database health information including:
 * - Connection status
 * - Extension verification
 * - Slow query analysis
 * - Performance metrics
 * 
 * Usage:
 * GET /api/health/db
 */

import { NextResponse } from 'next/server'
import { getDatabaseHealth } from '@/lib/server/drizzle/neon-utils'
import { checkDbHealth } from '@/lib/server/drizzle'

export async function GET() {
  try {
    // Basic connection check
    const connectionHealth = await checkDbHealth()
    
    // Comprehensive health check
    const health = await getDatabaseHealth()
    
    // Determine overall status
    const isHealthy = connectionHealth.healthy && health.healthy
    
    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        database: {
          connection: connectionHealth,
          health: health,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: isHealthy ? 200 : 503,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    )
  }
}
