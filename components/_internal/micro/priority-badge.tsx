/**
 * PriorityBadge - Domain Micro-Composite
 *
 * Uses priorityClasses from tokens. All composites must use this for priority display.
 * No custom styling allowed - this is the SSOT for priority rendering.
 */

import { Badge } from "@/components/primitives";
import { priorityClasses } from "@/lib/design-tokens";
import { AxisProps } from "@/lib/types/axis-props";
import { Priority } from "@/lib/schemas/domain";

export interface PriorityBadgeProps
  extends AxisProps<{
    priority: Priority;
  }> {}

/**
 * PriorityBadge component
 *
 * Renders a priority badge using domain tokens.
 *
 * @example
 * ```tsx
 * <PriorityBadge priority="critical" />
 * <PriorityBadge priority="high" />
 * ```
 */
export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const className = priorityClasses[priority];

  return (
    <Badge className={className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}
