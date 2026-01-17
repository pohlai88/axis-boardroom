/**
 * Multi-Tenant Drizzle Schema with Declarative RLS
 * 
 * This file demonstrates how to use Drizzle's declarative RLS policies
 * with your multi-tenant setup. These policies work alongside your existing
 * SQL-based RLS policies and can be used to generate migrations.
 * 
 * Reference: https://neon.com/docs/guides/rls-drizzle
 * 
 * Note: This is a reference implementation. Your existing SQL-based RLS
 * policies in multi-tenant-setup.sql will continue to work. You can
 * gradually migrate to Drizzle RLS or use both approaches.
 */

import { pgSchema, uuid, text, timestamp, jsonb, boolean, pgPolicy } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { crudPolicy, authenticatedRole, anonymousRole, authUid } from 'drizzle-orm/neon'

// ===========================================================================
// SCHEMA: axis_tenant
// ===========================================================================
export const axisTenant = pgSchema('axis_tenant')

// ===========================================================================
// TABLE: Organizations (Top-level tenants) with RLS
// ===========================================================================
export const organizations = axisTenant.table(
  'organizations',
  {
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
  },
  (table) => [
    // Using pgPolicy for complex multi-tenant access control
    // This replicates your existing SQL policies using Drizzle's declarative syntax
    
    // SELECT: Users can see organizations they're members of
    pgPolicy('org_select_policy', {
      for: 'select',
      to: authenticatedRole,
      using: sql`
        id IN (
          SELECT organization_id 
          FROM axis_tenant.memberships 
          WHERE user_id = (SELECT auth.user_id()) 
            AND status = 'active'
        )
      `,
    }),
    
    // INSERT: Disabled for normal users (use service role)
    pgPolicy('org_insert_policy', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`false`, // Disable for normal users
    }),
    
    // UPDATE: Org admins and owners can update
    pgPolicy('org_update_policy', {
      for: 'update',
      to: authenticatedRole,
      using: sql`axis_tenant.has_org_access(id, 'admin')`,
      withCheck: sql`axis_tenant.has_org_access(id, 'admin')`,
    }),
    
    // DELETE: Only org owners can delete
    pgPolicy('org_delete_policy', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`axis_tenant.has_org_access(id, 'owner')`,
    }),
  ]
)

// ===========================================================================
// TABLE: Teams (Sub-organizations) with RLS
// ===========================================================================
const teamsTable = axisTenant.table(
  'teams',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Core fields
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    
    // Hierarchy
    parentTeamId: uuid('parent_team_id'),
    
    // Settings
    settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
    
    // Status
    status: text('status', { enum: ['active', 'archived'] }).default('active'),
    
    // Audit
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by'),
  },
  (table) => [
    // SELECT: Users can see teams in their organizations
    pgPolicy('team_select_policy', {
      for: 'select',
      to: authenticatedRole,
      using: sql`
        organization_id IN (
          SELECT organization_id 
          FROM axis_tenant.memberships 
          WHERE user_id = (SELECT auth.user_id()) 
            AND status = 'active'
        )
      `,
    }),
    
    // INSERT: Org admins can create teams
    pgPolicy('team_insert_policy', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`axis_tenant.has_org_access(organization_id, 'admin')`,
    }),
    
    // UPDATE: Org admins and team managers can update
    pgPolicy('team_update_policy', {
      for: 'update',
      to: authenticatedRole,
      using: sql`
        axis_tenant.has_org_access(organization_id, 'admin') OR
        axis_tenant.has_team_access(id, 'manager')
      `,
      withCheck: sql`
        axis_tenant.has_org_access(organization_id, 'admin') OR
        axis_tenant.has_team_access(id, 'manager')
      `,
    }),
    
    // DELETE: Org admins can delete teams
    pgPolicy('team_delete_policy', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`axis_tenant.has_org_access(organization_id, 'admin')`,
    }),
  ]
)

export const teams = teamsTable

// ===========================================================================
// TABLE: Memberships with RLS
// ===========================================================================
export const memberships = axisTenant.table(
  'memberships',
  {
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
  },
  (table) => [
    // SELECT: Users can see memberships in their organizations
    pgPolicy('membership_select_policy', {
      for: 'select',
      to: authenticatedRole,
      using: sql`
        organization_id IN (
          SELECT organization_id 
          FROM axis_tenant.memberships 
          WHERE user_id = (SELECT auth.user_id()) 
            AND status = 'active'
        )
      `,
    }),
    
    // INSERT: Org admins can add members
    pgPolicy('membership_insert_policy', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`axis_tenant.has_org_access(organization_id, 'admin')`,
    }),
    
    // UPDATE: Org admins can update, users can update their own status
    pgPolicy('membership_update_policy', {
      for: 'update',
      to: authenticatedRole,
      using: sql`
        axis_tenant.has_org_access(organization_id, 'admin') OR
        user_id = (SELECT auth.user_id())
      `,
      withCheck: sql`
        axis_tenant.has_org_access(organization_id, 'admin') OR
        user_id = (SELECT auth.user_id())
      `,
    }),
    
    // DELETE: Org admins can remove members
    pgPolicy('membership_delete_policy', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`axis_tenant.has_org_access(organization_id, 'admin')`,
    }),
  ]
)

// ===========================================================================
// RELATIONS (same as original)
// ===========================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  teams: many(teams),
  memberships: many(memberships),
}))

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
  }
})

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
// TYPE INFERENCE
// ===========================================================================

export type Organization = typeof organizations.$inferSelect
export type InsertOrganization = typeof organizations.$inferInsert
export type Team = typeof teams.$inferSelect
export type InsertTeam = typeof teams.$inferInsert
export type Membership = typeof memberships.$inferSelect
export type InsertMembership = typeof memberships.$inferInsert

// ===========================================================================
// EXAMPLE: Simple table with crudPolicy (for reference)
// ===========================================================================

/**
 * Example: Simple user-owned table using crudPolicy
 * This shows how to use crudPolicy for simpler use cases
 */
export const exampleTodos = axisTenant.table(
  'example_todos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .default(sql`(SELECT auth.user_id())`),
    task: text('task').notNull(),
    isComplete: boolean('is_complete').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Simple crudPolicy: users can only access their own todos
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId), // Users can only read their own todos
      modify: authUid(table.userId), // Users can only create, update, or delete their own todos
    }),
  ]
)
