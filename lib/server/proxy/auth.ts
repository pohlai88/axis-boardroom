/**
 * Authentication Proxy Helpers
 * 
 * Utility functions for authentication checks in Proxy
 * These can be imported into proxy.ts for cleaner organization
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies
  const authToken = request.cookies.get("auth-token");
  return !!authToken;

  // Alternative: Check for session cookie
  // const session = request.cookies.get("session");
  // return !!session;
}

/**
 * Get redirect URL after login
 */
export function getLoginRedirect(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const loginUrl = new URL("/login", request.url);
  
  // Preserve the original path for redirect after login
  if (pathname !== "/login" && pathname !== "/") {
    loginUrl.searchParams.set("redirect", pathname);
  }
  
  return loginUrl.toString();
}

/**
 * Check if route requires authentication
 * 
 * Defines which routes are public vs protected
 */
export function requiresAuth(pathname: string): boolean {
  // Public routes that don't require auth
  const publicRoutes = [
    "/",
    "/login",
    "/api/health",
    "/api/webhooks", // Webhooks might be public
  ];

  // Public route prefixes (lab and demo routes)
  const publicRoutePrefixes = [
    "/demo",
    "/examples",
    "/playground",
  ];

  // API routes that require auth
  const protectedApiRoutes = [
    "/api/tasks",
    "/api/dashboard",
  ];

  // Check if it's a protected API route
  if (pathname.startsWith("/api/")) {
    return protectedApiRoutes.some((route) => pathname.startsWith(route));
  }

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    return false;
  }

  // Check if it's a public route prefix
  if (publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  // Production routes require auth
  // (dashboard, tasks, etc.)
  return true;
}

/**
 * Redirect to login if not authenticated
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = getLoginRedirect(request);
  return NextResponse.redirect(loginUrl);
}
