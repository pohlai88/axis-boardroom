/**
 * Security Headers Proxy Helpers
 * 
 * Utility functions for adding security headers in Proxy
 */

import { NextResponse } from "next/server";

/**
 * Add security headers to response
 * 
 * Implements OWASP security header best practices
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // DNS Prefetch Control - Helps with performance
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // HTTPS Strict Transport Security (HSTS)
  // Forces HTTPS for 2 years, includes subdomains, allows preloading
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection (useful for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy - Control what referrer information is sent
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (formerly Feature Policy)
  // Disable unnecessary browser features for security
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
    ].join(", ")
  );

  // Content Security Policy
  // Uncomment and customize based on your application needs
  // This is a strict CSP - adjust as needed
  /*
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Adjust for production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  */

  // Cross-Origin Embedder Policy (COEP)
  // Helps prevent cross-origin attacks
  // response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  // Cross-Origin Opener Policy (COOP)
  // Isolates browsing context
  // response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Cross-Origin Resource Policy (CORP)
  // Controls which origins can load resources
  // response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}

/**
 * Add CORS headers for API routes
 */
export function addCorsHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  // Allow specific origin or all origins (adjust for production)
  const allowedOrigin = origin || "*";

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}
