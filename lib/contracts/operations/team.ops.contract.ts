/**
 * Team Operations Contract
 * Input schemas for team mutations
 */

import { z } from "zod"
import { insertTeamDbSchema } from "../entities/team.contract"

// Create team input
export const createTeamInputSchema = insertTeamDbSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
})

// Update team input (all fields optional except id)
export const updateTeamInputSchema = createTeamInputSchema
  .partial()
  .extend({
    id: z.string().uuid("Invalid team ID"),
  })

// Delete team input
export const deleteTeamInputSchema = z.object({
  id: z.string().uuid("Team ID required"),
})

// Type exports
export type CreateTeamInput = z.infer<typeof createTeamInputSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamInputSchema>
export type DeleteTeamInput = z.infer<typeof deleteTeamInputSchema>
