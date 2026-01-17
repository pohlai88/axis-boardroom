/**
 * Drizzle ORM Schema
 * 
 * Database table definitions ONLY.
 * For validation schemas, see lib/contracts/entities/
 */

import { pgTable, serial, text, timestamp, decimal, integer, jsonb } from 'drizzle-orm/pg-core'

// Web Vitals Table
export const webVitals = pgTable('web_vitals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: decimal('value', { precision: 10, scale: 3 }).notNull(),
  metricId: text('metric_id').notNull(),
  delta: decimal('delta', { precision: 10, scale: 3 }),
  url: text('url').notNull(),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Errors Table
export const errors = pgTable('errors', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  filename: text('filename'),
  lineno: integer('lineno'),
  colno: integer('colno'),
  error: text('error'),
  stack: text('stack'),
  url: text('url').notNull(),
  userAgent: text('user_agent'),
  errorType: text('error_type'),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Analytics Aggregates Cache Table
export const analyticsAggregates = pgTable('analytics_aggregates', {
  id: serial('id').primaryKey(),
  metricType: text('metric_type').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Type inference (Drizzle native)
export type WebVital = typeof webVitals.$inferSelect
export type InsertWebVital = typeof webVitals.$inferInsert
export type Error = typeof errors.$inferSelect
export type InsertError = typeof errors.$inferInsert
export type AnalyticsAggregate = typeof analyticsAggregates.$inferSelect
export type InsertAnalyticsAggregate = typeof analyticsAggregates.$inferInsert
