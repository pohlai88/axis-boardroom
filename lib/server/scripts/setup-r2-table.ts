/**
 * R2 Files Table Setup Script
 * 
 * Creates the r2_files table in Neon database if it doesn't exist.
 * 
 * Usage:
 *   npm run db:setup-r2
 *   # or
 *   tsx lib/server/scripts/setup-r2-table.ts
 */

import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  console.error('\nTo fix this:')
  console.error('1. Create a .env.local file in the project root')
  console.error('2. Add your Neon connection string:')
  console.error('   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"')
  console.error('3. Get your connection string from: https://console.neon.tech')
  process.exit(1)
}

const sql = neon(DATABASE_URL, {
  fetchConnectionCache: true,
})

// SQL statements to execute
const SQL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS r2_files (
    id SERIAL PRIMARY KEY,
    object_key TEXT NOT NULL UNIQUE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_size TEXT,
    user_id TEXT NOT NULL,
    organization_id UUID,
    upload_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_r2_files_user_id ON r2_files(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_r2_files_organization_id ON r2_files(organization_id)`,
  `CREATE INDEX IF NOT EXISTS idx_r2_files_upload_timestamp ON r2_files(upload_timestamp DESC)`,
  `COMMENT ON TABLE r2_files IS 'Stores metadata for files uploaded to Cloudflare R2'`,
  `COMMENT ON COLUMN r2_files.object_key IS 'The key (path/filename) in R2 bucket'`,
  `COMMENT ON COLUMN r2_files.file_url IS 'Publicly accessible URL (if bucket is public)'`,
  `COMMENT ON COLUMN r2_files.user_id IS 'User who uploaded the file'`,
  `COMMENT ON COLUMN r2_files.organization_id IS 'Optional organization association for multi-tenant scenarios'`,
]

async function setupR2Table() {
  try {
    console.log('🔧 Setting up R2 files table...\n')

    // Execute SQL statements one by one
    // Note: neon serverless requires using sql.query() for raw SQL
    for (const statement of SQL_STATEMENTS) {
      // Use sql.query() for raw SQL statements
      await sql.query(statement)
    }

    console.log('✅ R2 files table created successfully!')
    console.log('\nTable: r2_files')
    console.log('Indexes:')
    console.log('  - idx_r2_files_user_id')
    console.log('  - idx_r2_files_organization_id')
    console.log('  - idx_r2_files_upload_timestamp')
    console.log('\n✨ Setup complete!')
  } catch (error) {
    console.error('❌ Error creating R2 files table:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

setupR2Table()
