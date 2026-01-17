"use client";

import React from "react";
import { PageHeader } from "@/components/axis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_internal/ui/card";

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Charts & Data Visualization"
        subtitle="Comprehensive data visualization components built on Recharts"
        breadcrumbs={[
          { label: "Showcase", href: "/showcase" },
          { label: "Charts" },
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chart Components</CardTitle>
            <CardDescription>Interactive data visualization charts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chart components showcase is under development. Individual chart components
              can be imported directly from <code className="text-sm bg-muted px-1 py-0.5 rounded">@/components/features/charts</code>.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Chart Library Features</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            <li>✓ Multiple chart types</li>
            <li>✓ Responsive designs</li>
            <li>✓ Interactive tooltips</li>
            <li>✓ Custom colors</li>
            <li>✓ Animations</li>
            <li>✓ Export capabilities</li>
            <li>✓ Real-time updates</li>
            <li>✓ Accessibility support</li>
            <li>✓ TypeScript types</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
