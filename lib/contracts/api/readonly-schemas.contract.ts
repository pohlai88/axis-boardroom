/**
 * Readonly Schemas
 * 
 * Schemas that enforce immutability at both type and runtime level.
 * Useful for configuration objects, cached data, and response objects.
 */

import { z } from "zod";

/**
 * Application Configuration Schema (Readonly)
 * 
 * Configuration that should not be modified after initialization.
 */
export const appConfigSchema = z.object({
  apiUrl: z.string().url().meta({
    description: "API base URL",
    example: "https://api.example.com",
  }),
  timeout: z.number().positive().meta({
    description: "Request timeout in milliseconds",
    example: 5000,
  }),
  retries: z.number().int().min(0).max(5).meta({
    description: "Number of retry attempts",
    example: 3,
  }),
  enableCache: z.boolean().meta({
    description: "Enable response caching",
    example: true,
  }),
}).readonly().meta({
  description: "Application configuration (immutable)",
});

export type AppConfig = z.infer<typeof appConfigSchema>;

/**
 * Cache Configuration Schema (Readonly)
 */
export const cacheConfigSchema = z.object({
  ttl: z.number().positive().meta({
    description: "Time to live in seconds",
    example: 3600,
  }),
  maxSize: z.number().positive().meta({
    description: "Maximum cache size",
    example: 1000,
  }),
  strategy: z.enum(["lru", "fifo", "lfu"]).meta({
    description: "Cache eviction strategy",
    example: "lru",
  }),
}).readonly().meta({
  description: "Cache configuration (immutable)",
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;
