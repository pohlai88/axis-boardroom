/**
 * Neon Data API Server Utilities
 * 
 * Server-side utilities for Neon Data API integration.
 * Use this for edge functions, API routes, and server components.
 * 
 * For client-side usage, use `@/lib/client/neon/data-api` instead.
 * 
 * Reference: https://neon.com/docs/data-api/overview
 */

import { env } from '@/lib/core/env'
import { createScopedLogger } from '@/lib/core/logger'

const logger = createScopedLogger('neon.data-api')

/**
 * Get Neon Data API URL
 * 
 * @returns Data API URL or null if not configured
 */
export function getDataApiUrl(): string | null {
  return env.NEXT_PUBLIC_NEON_DATA_API_URL || null
}

/**
 * Get Neon Data API Key (server-side only)
 * 
 * @returns Data API key or null if not configured
 */
export function getDataApiKey(): string | null {
  return env.NEON_DATA_API_KEY || null
}

/**
 * Check if Data API is configured
 * 
 * @returns True if Data API is available
 */
export function isDataApiConfigured(): boolean {
  return !!getDataApiUrl()
}

/**
 * Execute a query via Data API (server-side)
 * 
 * @param query SQL query
 * @param params Query parameters
 * @param token Optional authentication token for RLS
 * @returns Query results
 */
export async function executeDataApiQuery<T = unknown>(
  query: string,
  params: unknown[] = [],
  token?: string
): Promise<{ data: T[]; rows: number }> {
  const apiUrl = getDataApiUrl()
  const apiKey = getDataApiKey()

  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_NEON_DATA_API_URL is required. ' +
      'Get it from Neon Console > Project Settings > Data API'
    )
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Use API key if available, otherwise use token
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const body: {
    query: string
    params?: unknown[]
  } = {
    query,
  }

  if (params.length > 0) {
    body.params = params
  }

  try {
    logger.debug({ query: query.substring(0, 100) }, 'Executing Data API query')

    const response = await fetch(`${apiUrl}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error(
        { status: response.status, error: errorData },
        'Data API query failed'
      )
      throw new Error(
        errorData.message || `Data API error: ${response.statusText}`
      )
    }

    const data = await response.json()

    logger.debug(
      { rows: data.rows?.length || 0 },
      'Data API query completed'
    )

    return {
      data: data.rows || [],
      rows: data.rows?.length || 0,
    }
  } catch (error) {
    logger.error({ error, query: query.substring(0, 100) }, 'Data API error')
    throw error
  }
}
