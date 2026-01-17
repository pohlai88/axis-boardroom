/**
 * R2 Presigned Upload URL Endpoint
 * 
 * Generates a presigned URL for direct client uploads to Cloudflare R2.
 * 
 * POST /api/r2/presign-upload
 * 
 * Request Body:
 * {
 *   "fileName": "image.png",
 *   "contentType": "image/png"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "presignedUrl": "https://...",
 *   "objectKey": "uuid-filename",
 *   "publicFileUrl": "https://..."
 * }
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl, isR2Configured } from '@/lib/server/r2/client'
import { createScopedLogger } from '@/lib/core/logger'
import { z } from 'zod'

const logger = createScopedLogger('api.r2.presign')

// Request validation schema
const presignRequestSchema = z.object({
  fileName: z.string().min(1, 'fileName is required'),
  contentType: z.string().min(1, 'contentType is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Check if R2 is configured
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'R2 is not configured',
          message: 'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your environment variables',
          instructions: [
            '1. Go to Cloudflare Dashboard > R2',
            '2. Create a bucket',
            '3. Generate API tokens (Access Key ID and Secret Access Key)',
            '4. Find your Account ID',
            '5. Add credentials to .env.local',
          ],
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = presignRequestSchema.parse(body)

    // TODO: Replace with actual authentication
    // For now, we'll use a placeholder user ID
    // In production, extract from JWT token, session, etc.
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Generate presigned URL
    const result = await generatePresignedUploadUrl({
      fileName: validated.fileName,
      contentType: validated.contentType,
      expiresIn: 300, // 5 minutes
    })

    logger.info(
      { objectKey: result.objectKey, userId, fileName: validated.fileName },
      'Generated presigned upload URL'
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
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

    logger.error({ error }, 'Failed to generate presigned URL')
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
