/**
 * Membership Entity Contract
 * Generated from Drizzle schema with Zod validation
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { memberships } from '@/lib/server/drizzle/schema-multitenant'
import { z } from 'zod'

// Enum schemas (reusable)
export const membershipRoleSchema = z.enum(['owner', 'admin', 'manager', 'member', 'viewer'])
export const membershipStatusSchema = z.enum(['active', 'invited', 'suspended'])

// DB schemas (internal runtime)
export const membershipDbSchema = createSelectSchema(memberships)

export const insertMembershipDbSchema = createInsertSchema(memberships, {
  userId: z.string().uuid("Invalid user ID"),
  organizationId: z.string().uuid("Invalid organization ID"),
  teamId: z.string().uuid("Invalid team ID").optional().nullable(),
  role: membershipRoleSchema.default('member'),
  permissions: z.array(z.string()).default([]),
  status: membershipStatusSchema.default('active'),
  invitedBy: z.string().uuid().optional().nullable(),
  invitationToken: z.string().optional().nullable(),
  invitationExpiresAt: z.date().optional().nullable(),
  neonAuthMemberId: z.string().uuid().optional().nullable(),
  acceptedAt: z.date().optional().nullable(),
})

// API schemas (wire format with datetime strings)
export const membershipApiSchema = membershipDbSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  invitationExpiresAt: z.string().datetime().nullable().optional(),
  acceptedAt: z.string().datetime().nullable().optional(),
})

// Type exports
export type MembershipDb = z.infer<typeof membershipDbSchema>
export type InsertMembershipDb = z.infer<typeof insertMembershipDbSchema>
export type MembershipApi = z.infer<typeof membershipApiSchema>
export type MembershipRole = z.infer<typeof membershipRoleSchema>
export type MembershipStatus = z.infer<typeof membershipStatusSchema>
