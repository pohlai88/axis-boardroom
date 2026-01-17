/**
 * Analytics Client Component
 * 
 * Client component that receives initial data from server component
 * and uses TanStack Query for real-time updates and refetching.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_internal/ui/card";
import { Badge } from "@/components/_internal/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_internal/ui/tabs";
import { Skeleton } from "@/components/_internal/ui/skeleton";
import { Button } from "@/components/_internal/ui/button";
import { useWebVitals, useErrors } from "@/lib/client/hooks/use-analytics";
import { useAnalyticsStore } from "@/lib/client/zustand/analytics-store";

interface WebVitalsData {
  metrics?: any[];
  aggregates?: Record<string, any>;
  total?: number;
}

interface ErrorsData {
  errors?: any[];
  grouped?: any[];
  total?: number;
}

interface AnalyticsPageClientProps {
  initialWebVitals?: WebVitalsData;
  initialErrors?: ErrorsData;
}

function formatValue(name: string, value: number): string {
  if (name === "CLS") {
    return value.toFixed(3);
  }
  if (name === "TTFB" || name === "FCP" || name === "LCP" || name === "FID" || name === "INP") {
    return `${Math.round(value)}ms`;
  }
  return value.toString();
}

function getVitalStatus(name: string, value: number): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "FID":
    case "INP":
      return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
}

export function AnalyticsPageClient({ 
  initialWebVitals, 
  initialErrors 
}: AnalyticsPageClientProps) {
  // Use TanStack Query for data fetching (automatic caching, refetching)
  // Initial data from server component is used as fallback
  const { data: webVitalsData, isLoading: vitalsLoading, isFetching: vitalsFetching, refetch: refetchVitals } = useWebVitals(100);
  const { data: errorsData, isLoading: errorsLoading, isFetching: errorsFetching, refetch: refetchErrors } = useErrors(50);
  
  // Get Zustand store state
  const { webVitalsAggregates, errorsGrouped, isLoading: storeLoading } = useAnalyticsStore();
  
  const loading = vitalsLoading || errorsLoading || storeLoading;
  const refreshing = vitalsFetching || errorsFetching;
  
  // Use server-provided initial data as fallback, then client-fetched data
  const aggregates = (webVitalsData as WebVitalsData | undefined)?.aggregates 
    || initialWebVitals?.aggregates 
    || webVitalsAggregates;
  const hasAggregates = aggregates && Object.keys(aggregates).length > 0;
  const metrics = (webVitalsData as WebVitalsData | undefined)?.metrics 
    || initialWebVitals?.metrics 
    || [];
  const errors = (errorsData as ErrorsData | undefined)?.errors 
    || initialErrors?.errors 
    || [];
  const grouped = (errorsData as ErrorsData | undefined)?.grouped 
    || initialErrors?.grouped 
    || errorsGrouped 
    || [];
  const hasErrors = (errors.length > 0) || (grouped.length > 0);
  
  const handleRefresh = () => {
    refetchVitals();
    refetchErrors();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Self-hosted analytics - no external dependencies
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : hasAggregates ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(aggregates || {}).map(([name, stats]: [string, any]) => {
                  const status = getVitalStatus(name, stats.avg);
                  return (
                    <Card key={name}>
                      <CardHeader>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <CardDescription>Core Web Vital</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Average</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">
                                {formatValue(name, stats.avg)}
                              </span>
                              <Badge
                                variant={
                                  status === "good"
                                    ? "default"
                                    : status === "needs-improvement"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {status === "good"
                                  ? "Good"
                                  : status === "needs-improvement"
                                  ? "Needs Improvement"
                                  : "Poor"}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">P50:</span>{" "}
                              {formatValue(name, stats.p50)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">P95:</span>{" "}
                              {formatValue(name, stats.p95)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Min:</span>{" "}
                              {formatValue(name, stats.min)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Max:</span>{" "}
                              {formatValue(name, stats.max)}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.count} samples
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Metrics</CardTitle>
                  <CardDescription>
                    Last {metrics.length || 0} metrics collected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {metrics.slice(0, 20).map((metric: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{metric.name}</Badge>
                          <span>{formatValue(metric.name, metric.value)}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No Web Vitals data collected yet. Visit some pages to start collecting metrics.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : hasErrors ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Error Summary</CardTitle>
                  <CardDescription>
                    {(errorsData as ErrorsData | undefined)?.total 
                      || initialErrors?.total 
                      || errors.length 
                      || 0} total errors tracked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grouped.slice(0, 10).map((group: any, idx: number) => (
                      <div key={idx} className="border rounded p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{group.message}</div>
                          <Badge variant="destructive">{group.count} occurrences</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          First seen: {new Date(group.firstSeen).toLocaleString()}
                          <br />
                          Last seen: {new Date(group.lastSeen).toLocaleString()}
                        </div>
                        {group.errors[0]?.stack && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              Stack trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                              {group.errors[0].stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {errors.slice(0, 20).map((error: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 border rounded text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{error.message}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {error.url && (
                          <div className="text-xs text-muted-foreground truncate">
                            {error.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No errors tracked yet. Errors will appear here when they occur.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
