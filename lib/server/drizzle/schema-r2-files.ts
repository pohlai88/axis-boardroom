/**
 * R2 Files Schema
 * 
 * Schema for storing Cloudflare R2 file metadata in Neon database.
 * 
 * Reference: https://neon.com/docs/guides/cloudflare-r2
 * 
 * This table stores metadata about files uploaded to Cloudflare R2.
 * The actual files are stored in R2, while metadata (URLs, keys, user associations)
 * are stored in Neon for easy querying and access control.
 */

import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * R2 Files Table
 * 
 * Stores metadata for files uploaded to Cloudflare R2.
 * 
 * Fields:
 * - id: Primary key
 * - object_key: The key (path/filename) in R2 bucket
 * - file_url: Publicly accessible URL (if bucket is public)
 * - user_id: User who uploaded the file
 * - organization_id: Optional organization association
 * - file_name: Original filename
 * - content_type: MIME type (e.g., image/png, application/pdf)
 * - file_size: File size in bytes
 * - upload_timestamp: When the file was uploaded
 */
export const r2Files = pgTable('r2_files', {
  id: serial('id').primaryKey(),
  
  // R2 Object Information
  objectKey: text('object_key').notNull().unique(),
  fileUrl: text('file_url').notNull(),
  
  // File Metadata
  fileName: text('file_name').notNull(),
  contentType: text('content_type').notNull(),
  fileSize: text('file_size'), // Store as text to handle large numbers
  
  // User & Organization Association
  userId: text('user_id').notNull(),
  organizationId: uuid('organization_id'), // Optional: link to organization if using multi-tenant
  
  // Timestamps
  uploadTimestamp: timestamp('upload_timestamp', { withTimezone: true })
    .defaultNow()
    .notNull(),
  
  // Optional: Additional metadata as JSON
  metadata: text('metadata'), // Store as JSON string for flexibility
})

export type R2File = typeof r2Files.$inferSelect
export type NewR2File = typeof r2Files.$inferInsert
