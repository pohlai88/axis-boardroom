/**
 * R2 Setup Verification Script
 * 
 * Verifies that R2 is properly configured and ready to use.
 * 
 * Usage:
 *   tsx lib/server/scripts/verify-r2-setup.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Check R2 configuration
function checkR2Config() {
  console.log('🔍 Verifying R2 Configuration\n')
  console.log('=' .repeat(50))

  const required = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
  ]

  const optional = [
    'STORAGE_PROVIDER',
    'R2_PUBLIC_BASE_URL',
  ]

  let allPresent = true

  console.log('\n📋 Required Variables:')
  for (const key of required) {
    const value = process.env[key]
    if (value) {
      const masked = key.includes('SECRET') || key.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value
      console.log(`  ✅ ${key}: ${masked}`)
    } else {
      console.log(`  ❌ ${key}: Missing`)
      allPresent = false
    }
  }

  console.log('\n📋 Optional Variables:')
  for (const key of optional) {
    const value = process.env[key]
    if (value) {
      console.log(`  ✅ ${key}: ${value}`)
    } else {
      console.log(`  ⚠️  ${key}: Not set (optional)`)
    }
  }

  console.log('\n' + '='.repeat(50))

  if (allPresent) {
    console.log('\n✅ R2 Configuration: VALID')
    console.log('\n✨ R2 is ready to use!')
    console.log('\nNext steps:')
    console.log('  1. Run: npm run db:setup-r2')
    console.log('  2. Test upload: curl -X POST http://localhost:3000/api/r2/presign-upload \\')
    console.log('     -H "Content-Type: application/json" \\')
    console.log('     -d \'{"fileName": "test.png", "contentType": "image/png"}\'')
  } else {
    console.log('\n❌ R2 Configuration: INCOMPLETE')
    console.log('\nPlease add missing variables to .env.local')
    process.exit(1)
  }
}

// Check database table
async function checkDatabaseTable() {
  try {
    const { neon } = await import('@neondatabase/serverless')
    const DATABASE_URL = process.env.DATABASE_URL

    if (!DATABASE_URL) {
      console.log('\n⚠️  DATABASE_URL not set - skipping table check')
      return
    }

    const sql = neon(DATABASE_URL, { fetchConnectionCache: true })

    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'r2_files'
      ) as exists;
    `

    const tableExists = result[0]?.exists

    console.log('\n📊 Database Table:')
    if (tableExists) {
      console.log('  ✅ r2_files table exists')
    } else {
      console.log('  ❌ r2_files table does not exist')
      console.log('  Run: npm run db:setup-r2')
    }
  } catch (error) {
    console.log('\n⚠️  Could not check database table:', error instanceof Error ? error.message : error)
  }
}

async function main() {
  checkR2Config()
  await checkDatabaseTable()
}

main()
