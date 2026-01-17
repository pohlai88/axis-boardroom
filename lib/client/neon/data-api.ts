/**
 * Neon Data API Client
 * 
 * Client-side and edge-compatible database queries using Neon Data API.
 * 
 * Benefits:
 * - Works in browsers, Cloudflare Workers, and Vercel Edge
 * - Connectionless (no connection pool exhaustion)
 * - Secure by default (respects RLS policies)
 * - PostgREST compatible
 * 
 * Reference: https://neon.com/docs/data-api/overview
 * 
 * Usage:
 * ```ts
 * import { neonDataApi } from '@/lib/client/neon/data-api'
 * 
 * // Simple query
 * const result = await neonDataApi.query('SELECT * FROM users LIMIT 10')
 * 
 * // With authentication (for RLS)
 * const result = await neonDataApi.query(
 *   'SELECT * FROM tasks WHERE user_id = $1',
 *   { params: [userId], token: userToken }
 * )
 * ```
 */

'use client'

import { z } from 'zod'

// Environment variables (client-safe)
// Note: NEON_DATA_API_KEY is server-only and should not be accessed in client components
const DATA_API_URL = process.env.NEXT_PUBLIC_NEON_DATA_API_URL

/**
 * Data API Query Options
 */
export interface DataApiQueryOptions {
  /** SQL query string */
  query: string
  /** Query parameters (for parameterized queries) */
  params?: unknown[]
  /** Authentication token (for RLS) */
  token?: string
  /** Custom headers */
  headers?: Record<string, string>
}

/**
 * Data API Response
 */
export interface DataApiResponse<T = unknown> {
  data: T[]
  rows: number
  execution_time_ms?: number
}

/**
 * Data API Error
 */
export class DataApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'DataApiError'
  }
}

/**
 * Neon Data API Client
 * 
 * Provides a type-safe interface to Neon Data API for client-side queries.
 * 
 * **RLS Support**: Pass authentication tokens to enforce Row-Level Security policies.
 * The Data API automatically extracts user information from JWT claims using `auth.user_id()`.
 * 
 * @example
 * ```ts
 * const client = neonDataApi()
 * 
 * // Without RLS (public data)
 * const users = await client.query('SELECT * FROM users LIMIT 10')
 * 
 * // With RLS (user-specific data)
 * const todos = await client.query({
 *   query: 'SELECT * FROM todos WHERE user_id = $1',
 *   params: [userId],
 *   token: userToken, // JWT token for RLS
 * })
 * ```
 * 
 * @see https://neon.com/docs/guides/rls-drizzle
 */
export function neonDataApi() {
  if (!DATA_API_URL) {
    throw new Error(
      'NEXT_PUBLIC_NEON_DATA_API_URL is required for Data API. ' +
      'Get it from Neon Console > Project Settings > Data API'
    )
  }

  /**
   * Execute a SQL query via Data API
   * 
   * @param options Query options
   * @returns Query results
   */
  async function query<T = unknown>(
    options: DataApiQueryOptions | string
  ): Promise<DataApiResponse<T>> {
    const opts: DataApiQueryOptions =
      typeof options === 'string' ? { query: options } : options

    const { query: sql, params = [], token, headers = {} } = opts

    // Build request headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Add user token for RLS (client-side)
    // Note: Server-side API key is not available in client components
    // Use token for authentication instead
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    // Build request body
    const body: {
      query: string
      params?: unknown[]
    } = {
      query: sql,
    }

    if (params.length > 0) {
      body.params = params
    }

    try {
      const response = await fetch(`${DATA_API_URL}/query`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new DataApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData
        )
      }

      const data = await response.json()

      return {
        data: data.rows || [],
        rows: data.rows?.length || 0,
        execution_time_ms: data.execution_time_ms,
      }
    } catch (error) {
      if (error instanceof DataApiError) {
        throw error
      }

      throw new DataApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'QUERY_FAILED',
        error
      )
    }
  }

  /**
   * Execute a query with Zod validation
   * 
   * @param options Query options
   * @param schema Zod schema for validation
   * @returns Validated query results
   */
  async function queryWithSchema<T>(
    options: DataApiQueryOptions | string,
    schema: z.ZodSchema<T>
  ): Promise<T[]> {
    const result = await query<T>(options)
    return result.data.map((row) => schema.parse(row))
  }

  /**
   * Execute a single-row query
   * 
   * @param options Query options
   * @returns Single row or null
   */
  async function queryOne<T = unknown>(
    options: DataApiQueryOptions | string
  ): Promise<T | null> {
    const result = await query<T>(options)
    return result.data[0] || null
  }

  /**
   * Execute a single-row query with Zod validation
   * 
   * @param options Query options
   * @param schema Zod schema for validation
   * @returns Validated single row or null
   */
  async function queryOneWithSchema<T>(
    options: DataApiQueryOptions | string,
    schema: z.ZodSchema<T>
  ): Promise<T | null> {
    const row = await queryOne<T>(options)
    return row ? schema.parse(row) : null
  }

  return {
    query,
    queryWithSchema,
    queryOne,
    queryOneWithSchema,
  }
}

/**
 * Default Data API client instance
 * 
 * @example
 * ```ts
 * import { neonDataApi } from '@/lib/client/neon/data-api'
 * const users = await neonDataApi.query('SELECT * FROM users')
 * ```
 */
export const dataApi = neonDataApi()
