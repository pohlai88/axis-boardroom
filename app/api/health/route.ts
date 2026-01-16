/**
 * Health Check Route Handler
 * 
 * Simple health check endpoint for monitoring and load balancers
 * Uses Cache Components for optimal performance
 */

import { cacheLife } from "next/cache";
import { NextResponse } from "next/server";

async function getHealthStatus() {
  'use cache'
  cacheLife('seconds') // Cache for 30 seconds
  
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  };
}

export async function GET() {
  const health = await getHealthStatus();
  return NextResponse.json(health);
}
