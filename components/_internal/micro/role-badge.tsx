/**
 * RoleBadge - Domain Micro-Composite
 *
 * Uses roleClasses from tokens. All composites must use this for role display.
 * No custom styling allowed - this is the SSOT for role rendering.
 */

import { Badge } from "@/components/primitives";
import { roleClasses } from "@/lib/design-tokens";
import { AxisProps } from "@/lib/types/axis-props";
import { Role } from "@/lib/schemas/domain";

export interface RoleBadgeProps
  extends AxisProps<{
    role: Role;
  }> {}

/**
 * RoleBadge component
 *
 * Renders a role badge using domain tokens.
 *
 * @example
 * ```tsx
 * <RoleBadge role="ceo" />
 * <RoleBadge role="manager" />
 * ```
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const roleKey = role as keyof typeof roleClasses;
  const className = roleClasses[roleKey] ?? roleClasses.user;

  return (
    <Badge className={className}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
