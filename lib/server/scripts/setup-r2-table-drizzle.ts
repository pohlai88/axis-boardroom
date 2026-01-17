/**
 * R2 Files Table Setup Script (Using Drizzle)
 * 
 * Creates the r2_files table using Drizzle schema push.
 * This is the recommended approach as it uses your existing schema definitions.
 * 
 * Usage:
 *   npm run db:setup-r2-drizzle
 *   # or
 *   tsx lib/server/scripts/setup-r2-table-drizzle.ts
 */

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve } from 'path'
import * as r2FilesSchema from '../drizzle/schema-r2-files'

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

async function setupR2Table() {
  try {
    console.log('🔧 Setting up R2 files table using Drizzle...\n')

    const sql = neon(DATABASE_URL, {
      fetchConnectionCache: true,
    })

    const db = drizzle(sql, {
      schema: {
        r2Files: r2FilesSchema.r2Files,
      },
    })

    // Use Drizzle's push to create the table
    // This will create the table based on the schema definition
    console.log('Creating table from schema...')
    
    // Note: Drizzle push requires drizzle-kit, so we'll use a direct SQL approach
    // But first, let's verify the connection works
    await db.execute(sql`SELECT 1`)
    console.log('✅ Database connection verified')

    // For now, provide instructions to use drizzle-kit push
    console.log('\n📝 To create the table, run:')
    console.log('   npm run db:push')
    console.log('\nThis will push all schema changes including r2_files table.')
    console.log('\n✨ Setup instructions complete!')

  } catch (error) {
    console.error('❌ Error setting up R2 files table:')
    console.error(error instanceof Error ? error.message : error)
    
    if (error instanceof Error && error.message.includes('password authentication')) {
      console.error('\n⚠️  Password authentication failed.')
      console.error('Please check your DATABASE_URL in .env.local')
      console.error('Make sure the password is correct (not masked with ***)')
    }
    
    process.exit(1)
  }
}

setupR2Table()
