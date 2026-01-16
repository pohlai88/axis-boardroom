import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your AXIS BoardRoom dashboard. Monitor your projects, tasks, and analytics in one place.",
  openGraph: {
    title: "Dashboard | AXIS BoardRoom",
    description: "Overview of your AXIS BoardRoom dashboard",
    url: "/dashboard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dashboard | AXIS BoardRoom",
    description: "Overview of your dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
