/**
 * Next.js Proxy (formerly Middleware)
 * 
 * Proxy runs before a request is completed and can:
 * - Modify request/response headers
 * - Rewrite URLs
 * - Redirect requests
 * - Add security headers
 * - Implement authentication checks
 * 
 * Best Practices:
 * - Keep Proxy fast (Edge Runtime)
 * - Early returns for performance
 * - Use helper modules for organization
 * - Don't do heavy computations
 * 
 * Note: Proxy runs on Edge Runtime - limited Node.js APIs available
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addSecurityHeaders, addCorsHeaders } from "@/lib/proxy/security";
import { isAuthenticated, requiresAuth, redirectToLogin } from "@/lib/proxy/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Early return for static assets and Next.js internals
  // These don't need processing
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // 1. Maintenance Mode Check (Early Return)
  // Check before any other processing
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  if (isMaintenanceMode && !pathname.startsWith("/api/") && pathname !== "/maintenance") {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 2. Trailing Slash Normalization (Early Return)
  // Remove trailing slashes except for root - do this early
  if (pathname !== "/" && pathname.endsWith("/")) {
    url.pathname = pathname.slice(0, -1);
    // Preserve query string
    return NextResponse.redirect(url);
  }

  // 3. Query Parameter Cleanup (Early Return)
  // Remove unwanted tracking parameters
  const unwantedParams = ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid"];
  let hasQueryChanges = false;

  for (const param of unwantedParams) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasQueryChanges = true;
    }
  }

  if (hasQueryChanges) {
    return NextResponse.redirect(url);
  }

  // 4. Create response with security headers
  // Apply security headers to all routes
  let response = NextResponse.next();
  response = addSecurityHeaders(response);

  // 5. API Route Handling
  if (pathname.startsWith("/api/")) {
    // Handle OPTIONS preflight requests
    if (request.method === "OPTIONS") {
      const optionsResponse = new NextResponse(null, { status: 204 });
      return addCorsHeaders(optionsResponse, request.headers.get("origin") || undefined);
    }

    // Add CORS headers for API routes
    // In production, replace "*" with specific allowed origins
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
    response = addCorsHeaders(response, allowedOrigin === "*" ? undefined : allowedOrigin);

    // API route authentication check
    // Uncomment when authentication is implemented
    /*
    if (requiresAuth(pathname) && !isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    */

    return response;
  }

  // 6. Authentication Check for Protected Routes
  // Uncomment when authentication is implemented
  /*
  const isLoginPage = pathname === "/login";
  const isPublicRoute = pathname === "/" || 
                        pathname.startsWith("/demo") ||
                        pathname.startsWith("/examples") ||
                        pathname.startsWith("/playground");

  if (requiresAuth(pathname) && !isAuthenticated(request)) {
    // Redirect to login with return URL
    return redirectToLogin(request);
  }

  // Redirect authenticated users away from login
  if (isAuthenticated(request) && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  */

  // 7. A/B Testing (Optional)
  // Example: Route users to different variants
  /*
  if (pathname === "/") {
    const variantCookie = request.cookies.get("ab-variant");
    let variant = variantCookie?.value;

    if (!variant) {
      variant = Math.random() < 0.5 ? "a" : "b";
      response.cookies.set("ab-variant", variant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false, // Allow client-side access
        sameSite: "lax",
      });
    }

    // Rewrite to variant if needed
    if (variant === "b") {
      return NextResponse.rewrite(new URL("/?variant=b", request.url));
    }
  }
  */

  // 8. Geo-based Redirects (Optional)
  // Example: Redirect based on country
  /*
  const country = request.geo?.country;
  if (country === "GB" && pathname === "/") {
    return NextResponse.redirect(new URL("/uk", request.url));
  }
  */

  return response;
}

/**
 * Matcher Configuration
 * 
 * Controls which routes Proxy runs on.
 * Optimized to exclude static assets and Next.js internals.
 * 
 * Best Practice: Be specific to avoid unnecessary Proxy execution
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR in development)
     * - favicon.ico (favicon file)
     * - Static assets (images, fonts, etc.)
     * - API routes that don't need processing
     */
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|css|js)$).*)",
  ],
};
