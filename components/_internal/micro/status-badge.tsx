/**
 * StatusBadge - Domain Micro-Composite
 *
 * Uses statusClasses from tokens. All composites must use this for status display.
 * No custom styling allowed - this is the SSOT for status rendering.
 */

import { Badge } from "@/components/primitives";
import { statusClasses } from "@/lib/design-tokens";
import { AxisProps } from "@/lib/types/axis-props";
import { ApprovalStatus } from "@/lib/schemas/domain";

export interface StatusBadgeProps
  extends AxisProps<{
    status: ApprovalStatus | "draft" | "archived";
  }> {}

/**
 * StatusBadge component
 *
 * Renders a status badge using domain tokens.
 *
 * @example
 * ```tsx
 * <StatusBadge status="pending" />
 * <StatusBadge status="approved" />
 * ```
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const statusKey = status as keyof typeof statusClasses;
  const className = statusClasses[statusKey] ?? statusClasses.pending;

  return (
    <Badge className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
