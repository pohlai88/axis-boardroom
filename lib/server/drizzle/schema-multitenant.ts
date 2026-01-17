/**
 * Multi-Tenant Drizzle Schema
 * 
 * Database table definitions ONLY.
 * For validation schemas, see lib/contracts/entities/
 * Schema: axis_tenant
 */

import { pgSchema, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ===========================================================================
// SCHEMA: axis_tenant
// ===========================================================================
export const axisTenant = pgSchema('axis_tenant')

// ===========================================================================
// TABLE: Organizations (Top-level tenants)
// ===========================================================================
export const organizations = axisTenant.table('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Core fields
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').unique(),
  
  // Branding
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#3b82f6'),
  
  // Settings & metadata
  settings: jsonb('settings').$type<{
    features?: string[]
    max_users?: number
    [key: string]: unknown
  }>().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  
  // Status
  status: text('status', { enum: ['active', 'suspended', 'archived'] }).default('active'),
  
  // Neon Auth sync
  neonAuthOrgId: uuid('neon_auth_org_id').unique(),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
})

// ===========================================================================
// TABLE: Teams (Sub-organizations within tenants)
// ===========================================================================
const teamsTable = axisTenant.table('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Core fields
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  
  // Hierarchy - will be defined after table is created
  parentTeamId: uuid('parent_team_id'),
  
  // Settings
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  
  // Status
  status: text('status', { enum: ['active', 'archived'] }).default('active'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
})

// Export with self-reference added
export const teams = teamsTable;

// ===========================================================================
// TABLE: Memberships (User-Org-Team relationships)
// ===========================================================================
export const memberships = axisTenant.table('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Relationships
  userId: uuid('user_id').notNull(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  
  // Role & Permissions
  role: text('role', { 
    enum: ['owner', 'admin', 'manager', 'member', 'viewer'] 
  }).default('member').notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]),
  
  // Status & Invitation
  status: text('status', { enum: ['active', 'invited', 'suspended'] }).default('active'),
  invitedBy: uuid('invited_by'),
  invitationToken: text('invitation_token'),
  invitationExpiresAt: timestamp('invitation_expires_at', { withTimezone: true }),
  
  // Neon Auth sync
  neonAuthMemberId: uuid('neon_auth_member_id').unique(),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
})

// ===========================================================================
// RELATIONS
// ===========================================================================

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
  memberships: many(memberships),
}))

// Team relations
export const teamsRelations = relations(teams, ({ one, many }) => {
  return {
    organization: one(organizations, {
      fields: [teams.organizationId],
      references: [organizations.id],
    }),
    parentTeam: one(teams, {
      fields: [teams.parentTeamId],
      references: [teams.id],
      relationName: "parentTeam",
    }),
    childTeams: many(teams, {
      relationName: "parentTeam",
    }),
    memberships: many(memberships),
  };
})

// Membership relations
export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [memberships.teamId],
    references: [teams.id],
  }),
}))

// ===========================================================================
// TYPE INFERENCE (Drizzle native)
// ===========================================================================

// Organization types
export type Organization = typeof organizations.$inferSelect
export type InsertOrganization = typeof organizations.$inferInsert

// Team types
export type Team = typeof teams.$inferSelect
export type InsertTeam = typeof teams.$inferInsert

// Membership types
export type Membership = typeof memberships.$inferSelect
export type InsertMembership = typeof memberships.$inferInsert

// ===========================================================================
// ROLE HIERARCHY UTILITIES
// ===========================================================================

export const roleHierarchy = ['viewer', 'member', 'manager', 'admin', 'owner'] as const
export type Role = (typeof roleHierarchy)[number]

export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  const userLevel = roleHierarchy.indexOf(userRole)
  const minLevel = roleHierarchy.indexOf(minimumRole)
  return userLevel >= minLevel
}

export function isHigherRole(role1: Role, role2: Role): boolean {
  return roleHierarchy.indexOf(role1) > roleHierarchy.indexOf(role2)
}
