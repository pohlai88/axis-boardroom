/**
 * Domain Schemas
 *
 * Zod schemas for domain data used in AXIS composites.
 * Used for runtime validation via devAssert utility.
 */

import { z } from "zod";

/**
 * Approval Status Schema
 */
export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

/**
 * Priority Schema
 */
export const PrioritySchema = z.enum(["critical", "high", "medium", "low"]);

export type Priority = z.infer<typeof PrioritySchema>;

/**
 * Role Schema
 */
export const RoleSchema = z.enum(["ceo", "manager", "contributor", "user"]);

export type Role = z.infer<typeof RoleSchema>;

/**
 * Approver Schema
 */
export const ApproverSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  approved: z.boolean().optional(),
  approvedAt: z.date().optional(),
});

export type Approver = z.infer<typeof ApproverSchema>;

/**
 * Approval Panel Schema
 */
export const ApprovalPanelSchema = z.object({
  status: ApprovalStatusSchema,
  approvers: z.array(ApproverSchema).min(1),
  canAct: z.boolean().optional(),
});

export type ApprovalPanelData = z.infer<typeof ApprovalPanelSchema>;

/**
 * Audit Event Schema
 */
export const AuditEventSchema = z.object({
  id: z.string().min(1),
  actor: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
  }),
  action: z.string().min(1), // "created", "approved", "commented", etc.
  timestamp: z.date(),
  details: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

/**
 * Audit Timeline Schema
 */
export const AuditTimelineSchema = z.object({
  events: z.array(AuditEventSchema),
});

export type AuditTimelineData = z.infer<typeof AuditTimelineSchema>;
