/**
 * Analytics Layout
 * 
 * Uses 'use cache' at file level to cache the entire layout.
 * This enables partial prerendering for the analytics route.
 */

'use cache'

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
