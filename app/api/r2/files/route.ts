/**
 * R2 Files List Endpoint
 * 
 * Retrieves file metadata from Neon database.
 * 
 * GET /api/r2/files?userId=xxx&organizationId=xxx
 * 
 * Query Parameters:
 * - userId: Filter by user ID
 * - organizationId: Filter by organization ID
 * - limit: Maximum number of results (default: 50)
 * 
 * Response:
 * {
 *   "success": true,
 *   "files": [...],
 *   "count": 10
 * }
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/drizzle'
import { r2Files } from '@/lib/server/drizzle/schema-r2-files'
import { createScopedLogger } from '@/lib/core/logger'
import { eq, and, desc } from 'drizzle-orm'

const logger = createScopedLogger('api.r2.files')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const organizationId = searchParams.get('organizationId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Build query conditions
    const conditions = []
    if (userId) {
      conditions.push(eq(r2Files.userId, userId))
    }
    if (organizationId) {
      conditions.push(eq(r2Files.organizationId, organizationId))
    }

    // Query files
    const query = db
      .select()
      .from(r2Files)
      .orderBy(desc(r2Files.uploadTimestamp))
      .limit(Math.min(limit, 100)) // Cap at 100

    const files = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query

    logger.debug(
      { count: files.length, userId, organizationId },
      'Retrieved R2 files'
    )

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    })
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve files')
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
