"use client";

import React from "react";
import { PageHeader } from "@/components/axis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_internal/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_internal/ui/tabs";
import { Calendars, DatePicker } from "@/components/features/calendars";

export default function CalendarsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Calendars & Date Pickers"
        subtitle="Calendar implementations with date picking, range selection, and scheduling"
        breadcrumbs={[
          { label: "Showcase", href: "/showcase" },
          { label: "Calendars" },
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Component</CardTitle>
            <CardDescription>Interactive calendar with date selection</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendars calendars={[]} />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Date Picker</CardTitle>
              <CardDescription>Popup date picker component</CardDescription>
            </CardHeader>
            <CardContent>
              <DatePicker />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Calendar Features</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            <li>✓ Single date selection</li>
            <li>✓ Date range picker</li>
            <li>✓ Multiple dates</li>
            <li>✓ Disabled dates</li>
            <li>✓ Custom modifiers</li>
            <li>✓ Month/Year pickers</li>
            <li>✓ Time selection</li>
            <li>✓ Accessibility ready</li>
            <li>✓ Keyboard navigation</li>
            <li>✓ Responsive design</li>
            <li>✓ Customizable styles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
