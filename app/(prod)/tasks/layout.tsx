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

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
