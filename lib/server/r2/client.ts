/**
 * Cloudflare R2 Client
 * 
 * Server-side utilities for interacting with Cloudflare R2 storage.
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 * 
 * This module provides:
 * - S3-compatible client configuration
 * - Presigned URL generation for uploads
 * - File metadata management
 * 
 * Usage:
 * ```ts
 * import { getR2Client, generatePresignedUploadUrl } from '@/lib/server/r2/client'
 * 
 * const presignedUrl = await generatePresignedUploadUrl({
 *   fileName: 'image.png',
 *   contentType: 'image/png',
 * })
 * ```
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/lib/core/env'
import { createScopedLogger } from '@/lib/core/logger'
import { randomUUID } from 'crypto'

const logger = createScopedLogger('r2.client')

/**
 * R2 Configuration
 */
const R2_ENDPOINT = env.R2_ACCOUNT_ID
  ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : null

const R2_BUCKET = env.R2_BUCKET_NAME || null
const R2_PUBLIC_BASE_URL = env.R2_PUBLIC_BASE_URL || null

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  )
}

/**
 * Get R2 S3 Client
 * 
 * Returns configured S3 client for R2, or null if not configured.
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    logger.warn({}, 'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME')
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT!,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

/**
 * Presigned Upload URL Options
 */
export interface PresignedUploadOptions {
  fileName: string
  contentType: string
  expiresIn?: number // Seconds (default: 300 = 5 minutes)
}

/**
 * Presigned Upload URL Result
 */
export interface PresignedUploadResult {
  presignedUrl: string
  objectKey: string
  publicFileUrl: string | null
}

/**
 * Generate presigned URL for file upload
 * 
 * Creates a temporary, secure URL that allows direct upload to R2.
 * The client can use this URL to upload files directly without going through your server.
 * 
 * @param options Upload options
 * @returns Presigned URL and object key
 */
export async function generatePresignedUploadUrl(
  options: PresignedUploadOptions
): Promise<PresignedUploadResult> {
  const { fileName, contentType, expiresIn = 300 } = options

  const client = getR2Client()
  if (!client) {
    throw new Error(
      'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME'
    )
  }

  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET_NAME is required')
  }

  // Generate unique object key
  const objectKey = `${randomUUID()}-${fileName}`

  // Generate public URL if bucket is public
  const publicFileUrl = R2_PUBLIC_BASE_URL
    ? `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${objectKey}`
    : null

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn,
    })

    logger.debug(
      { objectKey, contentType, expiresIn },
      'Generated presigned upload URL'
    )

    return {
      presignedUrl,
      objectKey,
      publicFileUrl,
    }
  } catch (error) {
    logger.error({ error, fileName, contentType }, 'Failed to generate presigned URL')
    throw new Error(
      `Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generate presigned read URL (for private buckets)
 * 
 * Use this when you need to generate temporary access URLs for private files.
 * 
 * @param objectKey The object key in R2
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned read URL
 */
export async function generatePresignedReadUrl(
  objectKey: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client()
  if (!client) {
    throw new Error('R2 is not configured')
  }

  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET_NAME is required')
  }

  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    })

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn,
    })

    logger.debug({ objectKey, expiresIn }, 'Generated presigned read URL')

    return presignedUrl
  } catch (error) {
    logger.error({ error, objectKey }, 'Failed to generate presigned read URL')
    throw new Error(
      `Failed to generate presigned read URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
