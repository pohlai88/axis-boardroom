import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Toaster } from "@/components/_internal/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AXIS BoardRoom",
    template: "%s | AXIS BoardRoom",
  },
  description: "Production-safe UI governance system built with Next.js 16 and the AXIS design system",
  keywords: ["Next.js", "AXIS", "Design System", "UI Governance", "React", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "AXIS Team" }],
  creator: "AXIS",
  publisher: "AXIS",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AXIS BoardRoom",
    title: "AXIS BoardRoom",
    description: "Production-safe UI governance system built with Next.js 16 and the AXIS design system",
    // Add OG image when available
    // images: [
    //   {
    //     url: "/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "AXIS BoardRoom",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS BoardRoom",
    description: "Production-safe UI governance system",
    // Add Twitter image when available
    // images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when you have verification codes
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
