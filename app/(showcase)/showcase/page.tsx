"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/_internal/ui/card";
import { Button } from "@/components/_internal/ui/button";
import { Badge } from "@/components/_internal/ui/badge";
import {
  Layers,
  LayoutGrid,
  FormInput,
  BarChart3,
  Calendar,
  Sparkles,
  FileText,
  Package,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ShowcaseCategory {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  features: string[];
}

const categories: ShowcaseCategory[] = [
  {
    title: "AXIS Design System",
    description: "Complete design system with composites and micro components for enterprise applications.",
    href: "/showcase/components",
    icon: Layers,
    badge: "Core",
    features: [
      "PageHeader with breadcrumbs",
      "StatCard grid with trends",
      "DetailPanel with fields",
      "FilterBar with actions",
      "FormShell with states",
      "DataTableShell with empty states",
      "Status & Priority badges",
      "ConfirmDialog async/sync",
    ],
  },
  {
    title: "UI Components",
    description: "Modern UI components with Mira-style enhancements and accessible design patterns.",
    href: "/showcase/ui-components",
    icon: LayoutGrid,
    badge: "Enhanced",
    features: [
      "Alert dialogs with media",
      "Avatar groups",
      "Button groups with dropdowns",
      "Combobox with search",
      "Empty states",
      "Field components",
      "Input groups with addons",
      "Items with actions",
      "Sheets (all directions)",
      "Spinners and loading states",
    ],
  },
  {
    title: "Forms",
    description: "Comprehensive form patterns with validation, multi-step flows, and complex layouts.",
    href: "/showcase/forms",
    icon: FormInput,
    features: [
      "Simple user forms",
      "Payment method forms",
      "Field groups and separators",
      "Select dropdowns",
      "Radio groups",
      "Checkboxes and switches",
      "Sliders and ranges",
      "Textarea inputs",
    ],
  },
  {
    title: "Charts & Analytics",
    description: "Rich data visualization library with 70+ chart types built on Recharts.",
    href: "/showcase/charts",
    icon: BarChart3,
    badge: "70+ Charts",
    features: [
      "Line charts (15+ variants)",
      "Bar charts (15+ variants)",
      "Area charts (8+ variants)",
      "Pie & Donut charts",
      "Radar & Radial charts",
      "Mixed charts",
      "Interactive tooltips",
      "Responsive designs",
    ],
  },
  {
    title: "Calendars & Date Pickers",
    description: "32+ calendar implementations with date picking, range selection, and scheduling.",
    href: "/showcase/calendars",
    icon: Calendar,
    badge: "32+ Variants",
    features: [
      "Single date picker",
      "Date range picker",
      "Multiple dates",
      "Disabled dates",
      "Custom modifiers",
      "Month & year pickers",
      "Time selection",
      "Scheduling UI",
    ],
  },
  {
    title: "Playground",
    description: "Interactive AI playground for testing model parameters and prompts.",
    href: "/showcase/playground",
    icon: Sparkles,
    features: [
      "Model selection",
      "Mode switching (chat/complete/insert)",
      "Temperature controls",
      "Max length slider",
      "Top P configuration",
      "Preset configurations",
      "Example prompts",
      "Real-time output",
    ],
  },
];

export default function ShowcaseIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <Badge variant="secondary" className="mb-4">
          Component Showcase
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AXIS BoardRoom Design System
        </h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive showcase of production-ready components, patterns, and features
          for building modern SaaS ERP applications.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">150+</CardTitle>
            <CardDescription>Components</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">70+</CardTitle>
            <CardDescription>Chart Types</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">32+</CardTitle>
            <CardDescription>Calendar Variants</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">100%</CardTitle>
            <CardDescription>TypeScript</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.href}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  {category.badge && (
                    <Badge variant="outline">{category.badge}</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {category.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={category.href} className="block">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Explore {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-dashed">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Comprehensive guides and API references for all components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/docs">
              <Button variant="ghost" className="w-full">
                View Docs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <Package className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>Component Library</CardTitle>
            <CardDescription>
              Browse the full component library with live examples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/showcase/components">
              <Button variant="ghost" className="w-full">
                Browse Library
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <Sparkles className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>Playground</CardTitle>
            <CardDescription>
              Interactive environment to test and experiment with components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/showcase/playground">
              <Button variant="ghost" className="w-full">
                Open Playground
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
