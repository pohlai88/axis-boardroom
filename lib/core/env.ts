/**
 * Environment Variable Validation
 * 
 * Validates all environment variables at startup using Zod.
 * Fails fast if required variables are missing or invalid.
 */

import { z } from 'zod'

// Database URL validation - required in production, optional in development
const databaseUrlSchema = 
  process.env.NODE_ENV === 'production'
    ? z.string().url({ message: 'DATABASE_URL is required in production' })
    : z.string().url().optional()

const envSchema = z.object({
  // Database
  DATABASE_URL: databaseUrlSchema,
  // Read Replica (optional - for read scaling)
  DATABASE_REPLICA_URL: z.string().url().optional(),
  
  // Next.js
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  
  // Analytics
  NEXT_PUBLIC_ANALYTICS_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT: z.string().url().optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS
  ALLOWED_ORIGIN: z.string().optional(),
  
  // Maintenance (using coerce.boolean for string-to-boolean conversion)
  MAINTENANCE_MODE: z.coerce.boolean().default(false),
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  DEBUG_MODE: z.coerce.boolean().default(false),
  
  // Neon (optional)
  NEON_PROJECT_ID: z.string().optional(),
  // Neon API Key (optional - for Neon API SDK, project management)
  // Get this from Neon Console > Settings > API Keys
  NEON_API_KEY: z.string().optional(),
  // Neon Data API (optional - for client-side/edge queries)
  // Get this from Neon Console > Project Settings > Data API
  NEXT_PUBLIC_NEON_DATA_API_URL: z.string().url().optional(),
  NEON_DATA_API_KEY: z.string().optional(),
  
  // Storage Provider (optional - for file storage)
  // Options: 'r2', 's3', 'local', etc.
  STORAGE_PROVIDER: z.enum(['r2', 's3', 'local']).optional(),
  
  // Cloudflare R2 (optional - for file storage)
  // Get these from Cloudflare Dashboard > R2 > API Tokens
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
})

// Parse and validate environment variables
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_REPLICA_URL: process.env.DATABASE_REPLICA_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NEXT_PUBLIC_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT,
  REDIS_URL: process.env.REDIS_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
  DEBUG_MODE: process.env.DEBUG_MODE,
  NEON_PROJECT_ID: process.env.NEON_PROJECT_ID,
  NEON_API_KEY: process.env.NEON_API_KEY,
  NEXT_PUBLIC_NEON_DATA_API_URL: process.env.NEXT_PUBLIC_NEON_DATA_API_URL,
  NEON_DATA_API_KEY: process.env.NEON_DATA_API_KEY,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
})

// Type-safe environment access
export type Env = z.infer<typeof envSchema>
