/**
 * Web Vitals Component
 * 
 * Reports Core Web Vitals and performance metrics to analytics services.
 * Uses Next.js built-in useReportWebVitals hook for optimal performance.
 */

'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric)
    }

    // Send to self-hosted analytics endpoint
    // Use sendBeacon for reliability during page unload
    const analyticsEndpoint = 
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics/web-vitals'
    
    const body = JSON.stringify({
      ...metric,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })
    
    // Use sendBeacon for better performance (doesn't block page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(analyticsEndpoint, body)
    } else if (typeof fetch !== 'undefined') {
      // Fallback to fetch with keepalive
      fetch(analyticsEndpoint, {
        body,
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        // Silently fail - don't block user experience
        if (process.env.NODE_ENV === 'development') {
          console.error('[Web Vitals] Failed to send metric:', error)
        }
      })
    }

    // Google Analytics integration (if gtag is available)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag
      if (typeof gtag === 'function') {
        gtag('event', metric.name, {
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ), // values must be integers
          event_label: metric.id, // id unique to current page load
          non_interaction: true, // avoids affecting bounce rate
        })
      }
    }
  })

  return null // This component doesn't render anything
}
