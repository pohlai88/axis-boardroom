/**
 * Analytics Zustand Store
 * 
 * Global state management for analytics data.
 * Provides:
 * - Centralized analytics state
 * - Performance optimizations
 * - Type-safe state updates
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface WebVitalMetric {
  name: string
  value: number
  id: string
  delta: number
  timestamp: string
  url: string
  userAgent?: string
}

interface ErrorReport {
  message: string
  filename?: string
  lineno?: number
  colno?: number
  error?: string
  stack?: string
  timestamp: string
  url: string
  userAgent?: string
  type?: string
}

interface AnalyticsState {
  // Web Vitals
  webVitals: WebVitalMetric[]
  webVitalsAggregates: Record<string, any> | null
  
  // Errors
  errors: ErrorReport[]
  errorsGrouped: any[] | null
  
  // UI State
  isLoading: boolean
  lastUpdated: Date | null
  
  // Actions
  addWebVital: (metric: WebVitalMetric) => void
  setWebVitalsAggregates: (aggregates: Record<string, any>) => void
  addError: (error: ErrorReport) => void
  setErrorsGrouped: (grouped: any[]) => void
  setLoading: (loading: boolean) => void
  clearAnalytics: () => void
}

const MAX_METRICS = 1000
const MAX_ERRORS = 500

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        webVitals: [],
        webVitalsAggregates: null,
        errors: [],
        errorsGrouped: null,
        isLoading: false,
        lastUpdated: null,

        // Actions
        addWebVital: (metric) =>
          set((state) => {
            const newVitals = [...state.webVitals, metric]
            // Keep only recent metrics
            const trimmed = newVitals.length > MAX_METRICS 
              ? newVitals.slice(-MAX_METRICS)
              : newVitals
            return {
              webVitals: trimmed,
              lastUpdated: new Date(),
            }
          }),

        setWebVitalsAggregates: (aggregates) =>
          set({ webVitalsAggregates: aggregates }),

        addError: (error) =>
          set((state) => {
            const newErrors = [...state.errors, error]
            // Keep only recent errors
            const trimmed = newErrors.length > MAX_ERRORS
              ? newErrors.slice(-MAX_ERRORS)
              : newErrors
            return {
              errors: trimmed,
              lastUpdated: new Date(),
            }
          }),

        setErrorsGrouped: (grouped) =>
          set({ errorsGrouped: grouped }),

        setLoading: (loading) =>
          set({ isLoading: loading }),

        clearAnalytics: () =>
          set({
            webVitals: [],
            webVitalsAggregates: null,
            errors: [],
            errorsGrouped: null,
            lastUpdated: null,
          }),
      }),
      {
        name: 'analytics-storage',
        // Only persist essential data (not full metrics/errors arrays)
        partialize: (state) => ({
          lastUpdated: state.lastUpdated,
        }),
      }
    ),
    { name: 'AnalyticsStore' }
  )
)
