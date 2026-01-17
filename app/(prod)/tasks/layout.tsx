/**
 * Tasks Layout
 * 
 * WORKAROUND: Removed 'use cache' directive due to Next.js 16 issue.
 * The 'use cache' directive causes "Cannot redefine property: _debugInfo" errors
 * even with webpack mode. This is a known Next.js 16 bug.
 * 
 * Caching is handled at the page level instead.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks and track progress in AXIS BoardRoom. Create, update, and organize tasks with our intuitive task management system.",
  openGraph: {
    title: "Tasks | AXIS BoardRoom",
    description: "Manage your tasks and track progress in AXIS BoardRoom",
    url: "/tasks",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tasks | AXIS BoardRoom",
    description: "Manage your tasks and track progress",
  },
};

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
