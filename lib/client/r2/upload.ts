/**
 * R2 Client Upload Utilities
 * 
 * Client-side utilities for uploading files to Cloudflare R2.
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 * 
 * Usage:
 * ```ts
 * import { uploadFileToR2 } from '@/lib/client/r2/upload'
 * 
 * const result = await uploadFileToR2({
 *   file: fileInput.files[0],
 *   onProgress: (progress) => console.log(progress),
 * })
 * ```
 */

'use client'

/**
 * Upload File Options
 */
export interface UploadFileOptions {
  file: File
  onProgress?: (progress: number) => void
  organizationId?: string
}

/**
 * Upload File Result
 */
export interface UploadFileResult {
  success: boolean
  objectKey?: string
  fileUrl?: string
  fileId?: number
  error?: string
}

/**
 * Upload file to R2 using presigned URL
 * 
 * This function:
 * 1. Requests a presigned URL from the server
 * 2. Uploads the file directly to R2
 * 3. Saves metadata to Neon database
 * 
 * @param options Upload options
 * @returns Upload result
 */
export async function uploadFileToR2(
  options: UploadFileOptions
): Promise<UploadFileResult> {
  const { file, onProgress, organizationId } = options

  try {
    // Step 1: Get presigned URL
    const presignResponse = await fetch('/api/r2/presign-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication header
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      }),
    })

    if (!presignResponse.ok) {
      const error = await presignResponse.json()
      return {
        success: false,
        error: error.message || 'Failed to get presigned URL',
      }
    }

    const { presignedUrl, objectKey, publicFileUrl } =
      await presignResponse.json()

    if (!presignedUrl || !objectKey) {
      return {
        success: false,
        error: 'Invalid response from server',
      }
    }

    // Step 2: Upload file to R2
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: `Upload failed: ${uploadResponse.statusText}`,
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(100)
    }

    // Step 3: Save metadata to Neon
    const metadataResponse = await fetch('/api/r2/save-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication header
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        objectKey,
        publicFileUrl,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size.toString(),
        organizationId,
      }),
    })

    if (!metadataResponse.ok) {
      const error = await metadataResponse.json()
      return {
        success: false,
        error: error.message || 'Failed to save metadata',
      }
    }

    const metadata = await metadataResponse.json()

    return {
      success: true,
      objectKey,
      fileUrl: publicFileUrl || metadata.fileUrl,
      fileId: metadata.id,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error during upload',
    }
  }
}

/**
 * Get files for a user
 * 
 * @param userId User ID
 * @param organizationId Optional organization ID
 * @returns List of files
 */
export async function getFiles(
  userId?: string,
  organizationId?: string
): Promise<{ success: boolean; files?: unknown[]; error?: string }> {
  try {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (organizationId) params.append('organizationId', organizationId)

    const response = await fetch(`/api/r2/files?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to retrieve files',
      }
    }

    const data = await response.json()
    return {
      success: true,
      files: data.files || [],
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error retrieving files',
    }
  }
}
