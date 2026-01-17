/**
 * Health Check Route Handler
 * 
 * Simple health check endpoint for monitoring and load balancers.
 * Uses Cache Components for optimal performance.
 * 
 * For detailed database health, use: GET /api/health/db
 */

import { cacheLife } from "next/cache";
import { NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/server/drizzle";

async function getHealthStatus() {
  'use cache'
  cacheLife('seconds') // Cache for 30 seconds
  
  // Quick database check
  const dbHealth = await checkDbHealth();
  
  return {
    status: dbHealth.healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    database: dbHealth.healthy ? "connected" : "disconnected",
  };
}

export async function GET() {
  try {
    const health = await getHealthStatus();
    return NextResponse.json(health, {
      status: health.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
