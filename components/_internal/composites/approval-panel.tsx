/**
 * ApprovalPanel Composite
 *
 * Shows approval workflow, allows approve/reject/comment, shows routing.
 * Display-only pattern (no business logic). Logic stays in page/hook.
 * Uses devAssert for Zod validation and SafeText for XSS prevention.
 */

import React from "react";
import { Card, Badge, Button, Textarea } from "@/components/primitives";
import { StatusBadge } from "@/components/_internal/micro";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import {
  ApprovalPanelSchema,
  type ApprovalStatus,
  type Approver,
} from "@/lib/client/zod/domain";
import { SafeText } from "@/lib/shared/utils/safe-text";
import { cn } from "@/lib/core/utils";
import { format } from "date-fns";

export interface ApprovalPanelProps
  extends AxisProps<{
    status: ApprovalStatus;
    approvers: Approver[];
    comment?: string;
    onCommentChange?: (comment: string) => void;
    canAct?: boolean;
    showActions?: boolean;
    isLoading?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    policyHint?: React.ReactNode;
    footerSlot?: React.ReactNode;
  }> {}

/**
 * ApprovalPanel component
 *
 * Displays approval workflow with approvers, status, and actions.
 *
 * @example
 * ```tsx
 * <ApprovalPanel
 *   status={request.status}
 *   approvers={request.approvers}
 *   comment={comment}
 *   onCommentChange={setComment}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   canAct={user.canApprove}
 *   showActions
 * />
 * ```
 */
export function ApprovalPanel({
  status,
  approvers,
  comment,
  onCommentChange,
  canAct,
  showActions,
  isLoading,
  onApprove,
  onReject,
  policyHint,
  footerSlot,
}: ApprovalPanelProps) {
  // Validate props in dev
  devAssert(
    ApprovalPanelSchema,
    { status, approvers, canAct },
    "ApprovalPanelProps"
  );

  const allowActions = showActions ?? canAct;

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Approval Status</h3>
        <StatusBadge status={status} />
      </div>

      {policyHint && (
        <div className="text-sm text-muted-foreground">{policyHint}</div>
      )}

      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Approval Chain
        </h4>
        {approvers.map((approver) => (
          <div key={approver.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{approver.name}</p>
              <p className="text-sm text-muted-foreground">{approver.role}</p>
            </div>
            {approver.approved ? (
              <Badge className="bg-green-600 text-white">
                ✓ Approved{" "}
                {approver.approvedAt
                  ? format(approver.approvedAt, "MMM d, yyyy")
                  : ""}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white">Pending</Badge>
            )}
          </div>
        ))}
      </div>

      {allowActions && status === "pending" && (
        <div className="space-y-3 border-t pt-4">
          <Textarea
            placeholder="Add a comment..."
            value={comment ?? ""}
            onChange={(e) => onCommentChange?.(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button variant="default" onClick={onApprove} disabled={isLoading}>
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={isLoading}
            >
              Reject
            </Button>
          </div>
          {footerSlot}
        </div>
      )}

      {comment && (
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground">Comment</h4>
          <SafeText as="p" className="text-sm text-muted-foreground">
            {comment}
          </SafeText>
        </div>
      )}
    </Card>
  );
}
