import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  
  // Enable Cache Components (Partial Prerendering)
  // This enables mixing static, cached, and dynamic content in a single route
  cacheComponents: true,
  
  // Enable React compiler optimizations
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote image patterns (Next.js best practice)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  
  // Compress responses
  compress: true,
  
  // Experimental features for better performance
  // Note: SWC minification is enabled by default in Next.js 16
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
      "@tanstack/react-table",
    ],
  },
  
  // Turbopack configuration (Next.js 16 default)
  // Turbopack automatically handles bundle splitting and optimization
  // It's faster than webpack and doesn't require custom configuration
  turbopack: {},

  // Output configuration for Docker
  // Enable standalone output for smaller Docker images
  output: "standalone",
};

export default nextConfig;
