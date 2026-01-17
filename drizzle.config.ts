/**
 * Drizzle Kit Configuration
 * 
 * Configuration for database migrations and schema management.
 * 
 * Reference: https://orm.drizzle.team/docs/drizzle-config-file
 * 
 * Best Practices:
 * - Schema files are the source of truth
 * - Migrations are version-controlled
 * - Always review generated migrations before applying
 * 
 * Commands:
 * - npm run db:generate - Generate migration files
 * - npm run db:migrate - Apply migrations
 * - npm run db:push - Push schema changes (dev only)
 * - npm run db:studio - Open Drizzle Studio
 * 
 * Multiple Config Files:
 * - Use --config flag for different environments
 * - Example: npx drizzle-kit generate --config=drizzle-dev.config.ts
 */

import { defineConfig } from 'drizzle-kit'
import { env } from './lib/core/env'

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

export default defineConfig({
  // Schema files (all Drizzle table definitions)
  // Supports glob patterns: './lib/server/drizzle/**/*.ts'
  schema: [
    './lib/server/drizzle/schema.ts',
    './lib/server/drizzle/schema-multitenant.ts',
    './lib/server/drizzle/schema-r2-files.ts',
  ],
  
  // Migration output directory
  // Default: './drizzle' (we use custom path for organization)
  out: './drizzle/migrations',
  
  // Database dialect
  // Options: 'postgresql' | 'mysql' | 'sqlite' | 'turso' | 'singlestore' | 'mssql' | 'cockroachdb'
  dialect: 'postgresql',
  
  // Database credentials
  // For Neon: use connection string URL
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  
  // Verbose output for debugging
  // Default: true (we set to false in production)
  verbose: process.env.NODE_ENV === 'development',
  
  // Strict mode - prompts confirmation for push operations
  // Prevents accidental schema changes in production
  strict: true,
  
  // Migration configuration
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#migrations
  migrations: {
    prefix: 'timestamp', // 'timestamp' | 'sequential'
    table: '__drizzle_migrations__', // Migration tracking table
    schema: 'public', // Schema for migrations table
  },
  
  // Neon-specific: Exclude Neon-managed roles (if managing roles)
  // Uncomment if you're managing database roles with Drizzle
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#entities
  // entities: {
  //   roles: {
  //     provider: 'neon', // Excludes Neon-specific roles (neon_superuser, etc.)
  //     exclude: ['custom_role'], // Additional roles to exclude
  //   },
  // },
  
  // Schema filter (if managing multiple schemas)
  // Only manage specific schemas: ['public', 'axis_tenant']
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#schemafilter
  // schemaFilter: ['public', 'axis_tenant'],
  
  // Tables filter (if multiple projects share database)
  // Only manage tables matching pattern: ['axis_*', 'users']
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#tablesfilter
  // tablesFilter: ['axis_*'],
  
  // Extensions filter (if using PostGIS or similar)
  // Exclude extension-created tables: ['postgis']
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#extensionsfilters
  // extensionsFilters: ['postgis'],
  
  // Breakpoints (MySQL/SQLite only - not needed for PostgreSQL)
  // Default: true (only affects MySQL/SQLite)
  // Reference: https://orm.drizzle.team/docs/drizzle-config-file#breakpoints
  // breakpoints: true,
})
