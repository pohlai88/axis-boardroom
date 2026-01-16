import type { Metadata } from "next";
import { CoverExample } from "@/components/features/showcase/preview";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to AXIS BoardRoom - Production-safe UI governance system built with Next.js 16 and the AXIS design system",
  openGraph: {
    title: "AXIS BoardRoom",
    description: "Production-safe UI governance system built with Next.js 16 and the AXIS design system",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS BoardRoom",
    description: "Production-safe UI governance system",
  },
};

export default function Page() {
  return <CoverExample />;
}
