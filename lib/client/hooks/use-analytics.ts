/**
 * Analytics Hooks
 * 
 * Custom hooks for analytics data fetching using TanStack Query.
 * Provides:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * - Runtime validation of API responses
 */

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAnalyticsStore } from '@/lib/client/zustand/analytics-store'
import { useValidatedQuery } from './use-validated-query'
import { validatedFetch } from '@/lib/client/api/validated-fetch'
import {
  webVitalsResponseSchema,
  errorsResponseSchema,
  type WebVitalsResponse,
  type ErrorsResponse,
} from '@/lib/contracts'

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  webVitals: () => [...analyticsKeys.all, 'web-vitals'] as const,
  webVitalsAggregates: () => [...analyticsKeys.webVitals(), 'aggregates'] as const,
  errors: () => [...analyticsKeys.all, 'errors'] as const,
  errorsGrouped: () => [...analyticsKeys.errors(), 'grouped'] as const,
}

// Fetch functions with validation
async function fetchWebVitals(limit = 100): Promise<WebVitalsResponse> {
  return validatedFetch(
    `/api/analytics/web-vitals?limit=${limit}`,
    webVitalsResponseSchema
  )
}

async function fetchErrors(limit = 50): Promise<ErrorsResponse> {
  return validatedFetch(
    `/api/analytics/errors?limit=${limit}`,
    errorsResponseSchema
  )
}

// Hooks
export function useWebVitals(limit = 100) {
  const { setWebVitalsAggregates } = useAnalyticsStore()
  
  const query = useValidatedQuery<WebVitalsResponse, typeof webVitalsResponseSchema>({
    queryKey: [...analyticsKeys.webVitals(), limit],
    queryFn: () => fetchWebVitals(limit),
    schema: webVitalsResponseSchema,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  })
  
  // Update Zustand store when data changes (TanStack Query v5 doesn't have onSuccess)
  React.useEffect(() => {
    if (query.data?.aggregates) {
      setWebVitalsAggregates(query.data.aggregates)
    }
  }, [query.data, setWebVitalsAggregates])
  
  return query
}

export function useErrors(limit = 50) {
  const { setErrorsGrouped } = useAnalyticsStore()
  
  const query = useValidatedQuery<ErrorsResponse, typeof errorsResponseSchema>({
    queryKey: [...analyticsKeys.errors(), limit],
    queryFn: () => fetchErrors(limit),
    schema: errorsResponseSchema,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })
  
  // Update Zustand store when data changes
  React.useEffect(() => {
    if (query.data?.grouped) {
      setErrorsGrouped(query.data.grouped)
    }
  }, [query.data, setErrorsGrouped])
  
  return query
}

export function useSendWebVital() {
  const queryClient = useQueryClient()
  const { addWebVital } = useAnalyticsStore()
  
  return useMutation({
    mutationFn: async (metric: any) => {
      // Note: POST responses use ApiResult envelope, but we're not validating here
      // since mutations typically return simple success/error responses
      const res = await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      })
      if (!res.ok) throw new Error('Failed to send web vital')
      return res.json()
    },
    onSuccess: (_, metric) => {
      // Optimistically update local store
      addWebVital(metric)
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: analyticsKeys.webVitals() })
    },
  })
}

export function useSendError() {
  const queryClient = useQueryClient()
  const { addError } = useAnalyticsStore()
  
  return useMutation({
    mutationFn: async (error: any) => {
      // Note: POST responses use ApiResult envelope, but we're not validating here
      // since mutations typically return simple success/error responses
      const res = await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      })
      if (!res.ok) throw new Error('Failed to send error')
      return res.json()
    },
    onSuccess: (_, error) => {
      // Optimistically update local store
      addError(error)
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: analyticsKeys.errors() })
    },
  })
}
