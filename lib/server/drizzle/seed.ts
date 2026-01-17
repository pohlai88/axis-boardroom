/**
 * Drizzle Seed File
 * 
 * Generates realistic test data using drizzle-seed generators.
 * 
 * Reference:
 * - https://orm.drizzle.team/docs/seed-functions
 * - https://orm.drizzle.team/docs/seed-versioning
 * 
 * Usage:
 *   npm run db:seed              # Seed with default count (100)
 *   npm run db:seed -- 1000     # Seed with custom count
 *   npm run db:seed:reset        # Reset and seed (clears data first)
 *   npm run db:seed:reset -- 50  # Reset and seed with custom count
 */

// Load environment variables from .env.local or .env
import { config } from 'dotenv'
import { resolve } from 'path'

// Try to load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { seed, reset } from 'drizzle-seed'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'
import * as multitenantSchema from './schema-multitenant'

// Direct database connection for seeding (bypasses server-only modules)
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required for seeding.\n' +
    'Please set DATABASE_URL in .env.local or .env file.'
  )
}

const sql = neon(process.env.DATABASE_URL, {
  fetchConnectionCache: true,
})

const db = drizzle(sql, {
  schema: {
    ...schema,
    ...multitenantSchema,
  },
})

// Combine all schemas
const allSchemas = {
  ...schema,
  ...multitenantSchema,
}

// Seed version for generator consistency
// Reference: https://orm.drizzle.team/docs/seed-versioning
// Version must be a number: 1 or 2
const SEED_VERSION = 1

/**
 * Reset database (clear all data)
 * 
 * WARNING: This will delete all data from tables!
 */
export async function resetDatabase() {
  console.log('🗑️  Resetting database (clearing all data)...')
  await reset(db, allSchemas)
  console.log('✅ Database reset complete')
}

/**
 * Seed database with test data
 * 
 * @param count - Number of records to generate per table
 * @param options - Additional seeding options
 */
export async function seedDatabase(
  count: number = 100,
  options: {
    reset?: boolean
    version?: number // Version must be 1 or 2
    seed?: number // For deterministic data
  } = {}
) {
  const { reset: shouldReset = false, version = SEED_VERSION, seed: seedValue } = options

  if (shouldReset) {
    await resetDatabase()
  }

  console.log(`🌱 Starting database seeding with count: ${count}`)
  if (seedValue) {
    console.log(`📌 Using deterministic seed: ${seedValue}`)
  }
  console.log(`📦 Generator version: ${version}`)
  
  const seedOptions: { count: number; version?: number; seed?: number } = { count }
  if (version) seedOptions.version = version
  if (seedValue) seedOptions.seed = seedValue

  await seed(db, allSchemas, seedOptions).refine((funcs) => ({
    // ===========================================================================
    // MULTI-TENANT SCHEMA: Organizations
    // ===========================================================================
    organizations: {
      // Use 'with' option to create related data
      // Each organization will get teams and memberships
      with: {
        teams: 3, // Each org gets 3 teams
        memberships: 10, // Each org gets 10 memberships
      },
      columns: {
        name: funcs.companyName(),
        slug: funcs.string({ 
          minLength: 3, 
          maxLength: 50,
        }),
        domain: funcs.string({ 
          minLength: 5, 
          maxLength: 100 
        }),
        logoUrl: funcs.string({ 
          minLength: 10, 
          maxLength: 200 
        }),
        primaryColor: funcs.valuesFromArray({
          values: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
        }),
        // JSON fields
        // Reference: https://orm.drizzle.team/docs/seed-functions#json
        // Option 1: Use funcs.json() for random JSON structures (varied data)
        // Option 2: Use funcs.default() for fixed structures (consistent data)
        // Currently using funcs.json() for variation - change to funcs.default() if you need fixed structures
        settings: funcs.json(),
        metadata: funcs.json(),
        status: funcs.valuesFromArray({
          values: ['active', 'suspended', 'archived'],
        }),
        neonAuthOrgId: funcs.uuid(),
        createdBy: funcs.uuid(),
      },
    },
    
    // ===========================================================================
    // MULTI-TENANT SCHEMA: Teams
    // ===========================================================================
    teams: {
      // Teams are created via 'with' option on organizations
      // Additional standalone teams can be created here if needed
      columns: {
        name: funcs.valuesFromArray({
          values: [
            'Engineering',
            'Product',
            'Sales',
            'Marketing',
            'Customer Success',
            'Support',
            'Operations',
            'Finance',
            'HR',
            'Design',
            'Frontend Team',
            'Backend Team',
            'DevOps',
            'QA',
            'Research',
          ],
        }),
        slug: funcs.string({ 
          minLength: 2, 
          maxLength: 50 
        }),
        description: funcs.loremIpsum({ minLength: 20, maxLength: 200 }),
        parentTeamId: funcs.uuid(), // Will be set manually for hierarchy
        // JSON field - using funcs.json() for variation
        settings: funcs.json(),
        status: funcs.valuesFromArray({
          values: ['active', 'archived'],
        }),
        createdBy: funcs.uuid(),
      },
    },
    
    // ===========================================================================
    // MULTI-TENANT SCHEMA: Memberships
    // ===========================================================================
    memberships: {
      // Memberships are created via 'with' option on organizations
      // Additional standalone memberships can be created here if needed
      columns: {
        userId: funcs.uuid(),
        organizationId: funcs.uuid(),
        teamId: funcs.uuid(),
        role: funcs.valuesFromArray({
          values: ['owner', 'admin', 'manager', 'member', 'viewer'],
        }),
        // JSON field - using funcs.json() for variation
        // Note: permissions is a string[] in schema, but stored as JSON
        permissions: funcs.json(),
        status: funcs.valuesFromArray({
          values: ['active', 'invited', 'suspended'],
        }),
        neonAuthMemberId: funcs.uuid(),
        acceptedAt: funcs.timestamp({ 
          min: new Date('2024-01-01'), 
          max: new Date() 
        }),
        invitedBy: funcs.uuid(),
        invitationToken: funcs.string({ minLength: 10, maxLength: 100 }),
        invitationExpiresAt: funcs.timestamp({ 
          min: new Date('2024-01-01'), 
          max: new Date() 
        }),
      },
    },
    
    // ===========================================================================
    // ANALYTICS SCHEMA: Web Vitals
    // ===========================================================================
    webVitals: {
      columns: {
        name: funcs.valuesFromArray({
          values: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP'],
        }),
        value: funcs.number({ 
          minValue: 0, 
          maxValue: 10000, 
          precision: 100 
        }),
        metricId: funcs.uuid(),
        delta: funcs.number({ 
          minValue: -1000, 
          maxValue: 1000, 
          precision: 100 
        }),
        url: funcs.string({ 
          minLength: 10, 
          maxLength: 500 
        }),
        userAgent: funcs.string({ 
          minLength: 10, 
          maxLength: 500 
        }),
        timestamp: funcs.timestamp({ 
          min: new Date('2024-01-01'), 
          max: new Date() 
        }),
      },
    },
    
    // ===========================================================================
    // ANALYTICS SCHEMA: Errors
    // ===========================================================================
    errors: {
      columns: {
        message: funcs.string({ minLength: 10, maxLength: 5000 }),
        filename: funcs.string({ minLength: 5, maxLength: 500 }),
        lineno: funcs.int({ minValue: 1, maxValue: 10000 }),
        colno: funcs.int({ minValue: 1, maxValue: 1000 }),
        error: funcs.string({ minLength: 10, maxLength: 1000 }),
        stack: funcs.string({ minLength: 50, maxLength: 10000 }),
        url: funcs.string({ minLength: 10, maxLength: 500 }),
        userAgent: funcs.string({ minLength: 10, maxLength: 500 }),
        errorType: funcs.valuesFromArray({
          values: [
            'TypeError',
            'ReferenceError',
            'SyntaxError',
            'NetworkError',
            'ValidationError',
            'PermissionError',
            'Unknown',
          ],
        }),
        timestamp: funcs.timestamp({ 
          min: new Date('2024-01-01'), 
          max: new Date() 
        }),
      },
    },
    
    // ===========================================================================
    // ANALYTICS SCHEMA: Analytics Aggregates
    // ===========================================================================
    analyticsAggregates: {
      columns: {
        metricType: funcs.valuesFromArray({
          values: [
            'web_vitals',
            'errors',
            'page_views',
            'user_sessions',
            'api_requests',
          ],
        }),
        periodStart: funcs.timestamp({ 
          min: new Date('2024-01-01'), 
          max: new Date(Date.now() - 86400000) // Yesterday
        }),
        periodEnd: funcs.timestamp({ 
          min: new Date('2024-01-02'), 
          max: new Date() 
        }),
        // JSON field - using funcs.json() for variation
        // Reference: https://orm.drizzle.team/docs/seed-functions#json
        data: funcs.json(),
      },
    },
  }))
  
  console.log(`✅ Database seeded successfully`)
  console.log(`   - Organizations: ${count} (each with 3 teams and 10 memberships)`)
  console.log(`   - Web Vitals: ${count}`)
  console.log(`   - Errors: ${count}`)
  console.log(`   - Analytics Aggregates: ${count}`)
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const resetFlag = args.includes('--reset') || args.includes('-r')
  const countArg = args.find(arg => !arg.startsWith('-') && !isNaN(parseInt(arg, 10)))
  const count = countArg ? parseInt(countArg, 10) : 100
  
  if (isNaN(count) || count < 1) {
    console.error('❌ Invalid count. Please provide a positive number.')
    process.exit(1)
  }
  
  seedDatabase(count, { reset: resetFlag })
    .then(() => {
      console.log('🎉 Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        if (error.stack) {
          console.error('Stack trace:', error.stack)
        }
      }
      process.exit(1)
    })
}
