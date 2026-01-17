/**
 * Organization Operations Contract
 * Input schemas for organization mutations
 */

import { z } from "zod"
import { insertOrganizationDbSchema } from "../entities/organization.contract"

// Create organization input
export const createOrganizationInputSchema = insertOrganizationDbSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
})

// Update organization input (all fields optional except id)
export const updateOrganizationInputSchema = createOrganizationInputSchema
  .partial()
  .extend({
    id: z.string().uuid("Invalid organization ID"),
  })

// Delete organization input
export const deleteOrganizationInputSchema = z.object({
  id: z.string().uuid("Organization ID required"),
})

// Type exports
export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationInputSchema>
