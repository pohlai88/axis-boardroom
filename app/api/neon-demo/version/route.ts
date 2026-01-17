/**
 * Neon Database Demo - API Route Example
 * 
 * This endpoint demonstrates fetching data from Neon Postgres in an API Route.
 * 
 * Visit: http://localhost:3000/api/neon-demo/version
 */

import { sql } from '@/app/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await sql`SELECT version()`
    
    return NextResponse.json({
      success: true,
      version: result[0].version,
      timestamp: new Date().toISOString(),
    })
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
