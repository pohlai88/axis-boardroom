/**
 * Membership Operations Contract
 * Input schemas for membership mutations
 */

import { z } from "zod"
import { insertMembershipDbSchema, membershipRoleSchema } from "../entities/membership.contract"

// Create membership input (invite user)
export const createMembershipInputSchema = insertMembershipDbSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
  acceptedAt: true,
})

// Update membership input (change role/permissions)
export const updateMembershipInputSchema = z.object({
  id: z.string().uuid("Invalid membership ID"),
  role: membershipRoleSchema.optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['active', 'invited', 'suspended']).optional(),
})

// Accept invitation input
export const acceptInvitationInputSchema = z.object({
  invitationToken: z.string().min(1, "Invitation token required"),
})

// Delete membership input (remove user)
export const deleteMembershipInputSchema = z.object({
  id: z.string().uuid("Membership ID required"),
})

// Type exports
export type CreateMembershipInput = z.infer<typeof createMembershipInputSchema>
export type UpdateMembershipInput = z.infer<typeof updateMembershipInputSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>
export type DeleteMembershipInput = z.infer<typeof deleteMembershipInputSchema>
