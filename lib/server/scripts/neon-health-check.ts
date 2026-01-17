/**
 * Neon Database Health Check Script
 * 
 * Comprehensive health check for Neon database including:
 * - Connection status
 * - Extension verification
 * - Slow query analysis
 * - Branch status
 * - Performance metrics
 * 
 * Usage:
 * ```bash
 * tsx lib/server/scripts/neon-health-check.ts
 * ```
 */

// Load environment variables FIRST (before any imports that use them)
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (higher priority), then .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

// Load .env.local if it exists
config({ path: envLocalPath, override: false })

// Load .env if it exists (won't override .env.local values)
config({ path: envPath, override: false })

// Now import database modules (they can use process.env.DATABASE_URL)
import { getDatabaseHealth, getProjectInfo } from '../drizzle/neon-utils'
import { checkDbHealth } from '../drizzle'

// Simple logger for standalone script (avoids server-only dependency)
const logger = {
  error: (obj: any, msg: string) => console.error(`[ERROR] ${msg}`, obj),
  warn: (obj: any, msg: string) => console.warn(`[WARN] ${msg}`, obj),
  info: (obj: any, msg: string) => console.info(`[INFO] ${msg}`, obj),
  debug: (obj: any, msg: string) => console.debug(`[DEBUG] ${msg}`, obj),
}

async function main() {
  console.log('🔍 Neon Database Health Check\n')
  console.log('=' .repeat(50))

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ Error: DATABASE_URL environment variable is not set')
    console.error('\nTo fix this:')
    console.error('1. Create a .env.local file in the project root')
    console.error('2. Add your Neon connection string:')
    console.error('   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"')
    console.error('3. Get your connection string from: https://console.neon.tech')
    console.error('   → Select your project → Click "Connect"')
    console.error('\nSee docs/NEON_CONNECTION_SETUP.md for detailed instructions.\n')
    console.error('\nDebug info:')
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
    console.error(`   Files checked: .env.local, .env`)
    process.exit(1)
  }

  // Debug: Show that DATABASE_URL is loaded (masked)
  const maskedUrl = process.env.DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
  console.log(`\n📋 DATABASE_URL loaded: ${maskedUrl.substring(0, 60)}...`)
  console.log('')

  try {
    // 1. Project Information
    console.log('\n📦 Project Information:')
    const projectInfo = await getProjectInfo()
    console.log(`   Project ID: ${projectInfo.projectId}`)
    console.log(`   Name: ${projectInfo.name}`)
    console.log(`   Region: ${projectInfo.region}`)
    console.log(`   PostgreSQL: ${projectInfo.pgVersion}`)

    // 2. Connection Health
    console.log('\n🔌 Connection Health:')
    const connectionHealth = await checkDbHealth()
    if (connectionHealth.healthy) {
      console.log('   ✅ Database connection: Healthy')
    } else {
      console.log(`   ❌ Database connection: Failed`)
      console.log(`   Error: ${connectionHealth.error}`)
      
      // Provide helpful error messages for common issues
      if (connectionHealth.error?.includes('password authentication')) {
        console.log('\n   💡 Password authentication failed:')
        console.log('      - Check if password in DATABASE_URL is correct')
        console.log('      - Password may have expired - reset in Neon Console')
        console.log('      - Get fresh connection string from: https://console.neon.tech')
      } else if (connectionHealth.error?.includes('DATABASE_URL')) {
        console.log('\n   💡 DATABASE_URL issue:')
        console.log('      - Verify connection string format')
        console.log('      - Check .env.local or .env file')
      }
    }

    // 3. Comprehensive Health Check
    console.log('\n🏥 Comprehensive Health Check:')
    const health = await getDatabaseHealth()
    
    if (health.healthy) {
      console.log('   ✅ Overall Status: Healthy')
    } else {
      console.log('   ❌ Overall Status: Unhealthy')
      if (health.error) {
        console.log(`   Error: ${health.error}`)
      }
    }

    // 4. Extensions
    if (health.extensions) {
      console.log('\n📦 Extensions:')
      if (health.extensions.healthy) {
        console.log('   ✅ All required extensions installed')
        if (health.extensions.installed) {
          health.extensions.installed.forEach(ext => {
            console.log(`      - ${ext}`)
          })
        }
        if (health.extensions.details) {
          health.extensions.details.forEach((detail: any) => {
            console.log(`      - ${detail.name} (v${detail.version})`)
          })
        }
      } else {
        console.log('   ⚠️  Extension check issues')
        if (health.extensions.missing && health.extensions.missing.length > 0) {
          console.log('   Missing extensions:')
          health.extensions.missing.forEach(ext => {
            console.log(`      - ${ext}`)
          })
          console.log('\n   💡 To install pg_stat_statements:')
          console.log('      Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;')
          console.log('      Or use Neon MCP: mcp_Neon_run_sql')
        }
        if (health.extensions.error) {
          console.log(`   Error: ${health.extensions.error}`)
        }
      }
    }

    // 5. Slow Queries
    if (health.slowQueries) {
      console.log('\n🐌 Slow Queries:')
      console.log(`   Found: ${health.slowQueries.count} slow queries`)
      if (health.slowQueries.queries && health.slowQueries.queries.length > 0) {
        console.log('\n   Top slow queries:')
        health.slowQueries.queries.forEach((query, index) => {
          console.log(`   ${index + 1}. ${query.query.substring(0, 60)}...`)
          console.log(`      Mean time: ${query.mean_exec_time_ms.toFixed(2)}ms`)
          console.log(`      Calls: ${query.calls}`)
        })
      } else {
        console.log('   ✅ No slow queries detected')
      }
    }

    // 6. Timestamp
    console.log(`\n⏰ Check performed at: ${health.timestamp}`)

    // 7. Summary
    console.log('\n' + '='.repeat(50))
    if (health.healthy) {
      console.log('✅ Health Check: PASSED')
      process.exit(0)
    } else {
      console.log('❌ Health Check: FAILED')
      process.exit(1)
    }
  } catch (error) {
    logger.error({ error }, 'Health check failed')
    console.error('\n❌ Health check failed with error:')
    console.error(error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main as healthCheck }
