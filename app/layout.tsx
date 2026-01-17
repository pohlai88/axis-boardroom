import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Toaster } from "@/components/_internal/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "AXIS BoardRoom - Production-Safe UI Governance System",
    template: "%s | AXIS BoardRoom",
  },
  description:
    "A comprehensive SaaS ERP platform with enterprise-grade components, analytics, and task management built on Next.js 16.",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "SaaS",
    "ERP",
    "Component Library",
    "Design System",
    "Dashboard",
    "Analytics",
  ],
  authors: [{ name: "AXIS BoardRoom Team" }],
  creator: "AXIS BoardRoom",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AXIS BoardRoom",
    title: "AXIS BoardRoom - Production-Safe UI Governance System",
    description:
      "A comprehensive SaaS ERP platform with enterprise-grade components, analytics, and task management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS BoardRoom",
    description:
      "A comprehensive SaaS ERP platform with enterprise-grade components, analytics, and task management.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClientLayout>
          {children}
          <Toaster />
        </ClientLayout>
      </body>
    </html>
  );
}
