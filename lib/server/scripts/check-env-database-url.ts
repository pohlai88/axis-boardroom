/**
 * Check DATABASE_URL in Environment Files
 * 
 * This script checks for DATABASE_URL in .env and .env.local files
 * and validates the connection string format.
 * 
 * Usage:
 * ```bash
 * tsx lib/server/scripts/check-env-database-url.ts
 * ```
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const projectRoot = process.cwd()

interface EnvCheckResult {
  file: string
  exists: boolean
  hasDatabaseUrl: boolean
  databaseUrl?: string
  isValid: boolean
  errors: string[]
}

function checkEnvFile(fileName: string): EnvCheckResult {
  const filePath = join(projectRoot, fileName)
  const exists = existsSync(filePath)
  const result: EnvCheckResult = {
    file: fileName,
    exists,
    hasDatabaseUrl: false,
    isValid: false,
    errors: [],
  }

  if (!exists) {
    result.errors.push(`File ${fileName} does not exist`)
    return result
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    
    // Check for DATABASE_URL
    const databaseUrlMatch = content.match(/^DATABASE_URL=(.+)$/m)
    
    if (!databaseUrlMatch) {
      result.errors.push('DATABASE_URL not found in file')
      return result
    }

    result.hasDatabaseUrl = true
    const databaseUrl = databaseUrlMatch[1].trim()
    
    // Remove quotes if present
    const cleanUrl = databaseUrl.replace(/^["']|["']$/g, '')
    result.databaseUrl = cleanUrl

    // Validate format
    if (!cleanUrl.startsWith('postgresql://')) {
      result.errors.push('DATABASE_URL must start with postgresql://')
    }

    if (!cleanUrl.includes('@')) {
      result.errors.push('DATABASE_URL missing @ (host separator)')
    }

    if (!cleanUrl.includes('/')) {
      result.errors.push('DATABASE_URL missing / (database separator)')
    }

    // Check for SSL mode (recommended but not required)
    if (!cleanUrl.includes('sslmode=')) {
      result.warnings = result.warnings || []
      result.warnings.push('DATABASE_URL should include sslmode=require for security')
    } else if (!cleanUrl.includes('sslmode=require')) {
      result.warnings = result.warnings || []
      result.warnings.push('DATABASE_URL should use sslmode=require (not prefer or allow)')
    }

    // Check for line breaks (common issue)
    if (cleanUrl.includes('\n') || cleanUrl.includes('\r')) {
      result.errors.push('DATABASE_URL appears to be split across multiple lines')
    }
    
    // Validate URL structure
    try {
      new URL(cleanUrl)
    } catch {
      result.errors.push('DATABASE_URL is not a valid URL format')
    }

    result.isValid = result.errors.length === 0
  } catch (error) {
    result.errors.push(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

function main() {
  console.log('🔍 Checking DATABASE_URL in Environment Files\n')
  console.log('='.repeat(60))

  const files = ['.env', '.env.local']
  const results: EnvCheckResult[] = []

  for (const file of files) {
    console.log(`\n📄 Checking ${file}...`)
    const result = checkEnvFile(file)
    results.push(result)

    if (!result.exists) {
      console.log(`   ❌ File does not exist`)
      continue
    }

    if (!result.hasDatabaseUrl) {
      console.log(`   ⚠️  DATABASE_URL not found`)
      continue
    }

    if (result.isValid) {
      console.log(`   ✅ DATABASE_URL found and valid`)
      // Show masked URL (hide password)
      const maskedUrl = result.databaseUrl?.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@') || ''
      console.log(`   📋 ${maskedUrl.substring(0, 80)}...`)
      if (result.warnings && result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`)
        result.warnings.forEach(warning => {
          console.log(`      - ${warning}`)
        })
      }
    } else {
      console.log(`   ❌ DATABASE_URL found but has issues:`)
      result.errors.forEach(error => {
        console.log(`      - ${error}`)
      })
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`      ⚠️  ${warning}`)
        })
      }
      if (result.databaseUrl) {
        const maskedUrl = result.databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
        console.log(`   📋 Current value: ${maskedUrl.substring(0, 80)}...`)
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Summary:')

  const validFiles = results.filter(r => r.exists && r.isValid)
  const invalidFiles = results.filter(r => r.exists && r.hasDatabaseUrl && !r.isValid)
  const missingFiles = results.filter(r => !r.exists || !r.hasDatabaseUrl)

  if (validFiles.length > 0) {
    console.log(`\n✅ Valid DATABASE_URL found in:`)
    validFiles.forEach(r => console.log(`   - ${r.file}`))
  }

  if (invalidFiles.length > 0) {
    console.log(`\n⚠️  DATABASE_URL needs fixing in:`)
    invalidFiles.forEach(r => {
      console.log(`   - ${r.file}`)
      r.errors.forEach(e => console.log(`     • ${e}`))
    })
  }

  if (missingFiles.length > 0) {
    console.log(`\n❌ DATABASE_URL missing in:`)
    missingFiles.forEach(r => console.log(`   - ${r.file}`))
  }

  // Recommendations
  console.log('\n💡 Recommendations:')
  
  if (validFiles.length === 0) {
    console.log('   1. Create .env.local file in project root')
    console.log('   2. Add DATABASE_URL from Neon Console')
    console.log('   3. Format: DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"')
    console.log('   4. Get connection string from: https://console.neon.tech')
  } else {
    console.log('   ✅ DATABASE_URL is configured correctly')
    console.log('   💡 Use .env.local for local development (not committed to git)')
    console.log('   💡 Use .env for team-shared configuration (if needed)')
  }

  // Exit code
  const hasValid = validFiles.length > 0
  process.exit(hasValid ? 0 : 1)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { checkEnvFile, main as checkDatabaseUrl }
