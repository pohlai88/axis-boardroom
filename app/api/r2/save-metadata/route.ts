/**
 * R2 Save Metadata Endpoint
 * 
 * Saves file metadata to Neon database after successful upload to R2.
 * 
 * POST /api/r2/save-metadata
 * 
 * Request Body:
 * {
 *   "objectKey": "uuid-filename",
 *   "publicFileUrl": "https://...",
 *   "fileName": "image.png",
 *   "contentType": "image/png",
 *   "fileSize": "12345"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "id": 1
 * }
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/drizzle'
import { r2Files } from '@/lib/server/drizzle/schema-r2-files'
import { createScopedLogger } from '@/lib/core/logger'
import { z } from 'zod'
import { env } from '@/lib/core/env'

const logger = createScopedLogger('api.r2.metadata')

// Request validation schema
const saveMetadataRequestSchema = z.object({
  objectKey: z.string().min(1, 'objectKey is required'),
  publicFileUrl: z.string().url().optional(),
  fileName: z.string().min(1, 'fileName is required'),
  contentType: z.string().min(1, 'contentType is required'),
  fileSize: z.string().optional(),
  organizationId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = saveMetadataRequestSchema.parse(body)

    // TODO: Replace with actual authentication
    // For now, we'll use a placeholder user ID
    // In production, extract from JWT token, session, etc.
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Build final file URL
    const finalFileUrl =
      validated.publicFileUrl ||
      (env.R2_PUBLIC_BASE_URL
        ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${validated.objectKey}`
        : 'URL not available')

    // Save metadata to database
    const [fileRecord] = await db
      .insert(r2Files)
      .values({
        objectKey: validated.objectKey,
        fileUrl: finalFileUrl,
        fileName: validated.fileName,
        contentType: validated.contentType,
        fileSize: validated.fileSize,
        userId,
        organizationId: validated.organizationId || null,
      })
      .returning()

    logger.info(
      { id: fileRecord.id, objectKey: validated.objectKey, userId },
      'Saved R2 file metadata'
    )

    return NextResponse.json(
      {
        success: true,
        id: fileRecord.id,
        objectKey: fileRecord.objectKey,
        fileUrl: fileRecord.fileUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn({ error: error.issues }, 'Invalid request body')
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Failed to save metadata')
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
