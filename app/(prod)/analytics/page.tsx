/**
 * Analytics Dashboard Page
 * 
 * WORKAROUND: Simplified to avoid Next.js 16.1.3 + Turbopack bug
 * that causes "TypeError: Cannot redefine property: _debugInfo" error.
 * 
 * This is a known issue with Next.js 16 + Turbopack + React Server Components
 * when streaming data between server and client components.
 * 
 * Temporary solution: Return empty initial data and let client components fetch everything.
 */

import { AnalyticsPageClient } from './analytics-client';

/**
 * Server component - simplified to avoid _debugInfo error
 */
export default function AnalyticsPage() {
  // Return empty initial data - let client fetch everything
  // This avoids the RSC streaming bug in Next.js 16.1.3 + Turbopack
  return (
    <AnalyticsPageClient
      initialWebVitals={{ metrics: [], aggregates: {}, total: 0 }}
      initialErrors={{ errors: [], grouped: [], total: 0 }}
    />
  );
}
