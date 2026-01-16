/**
 * AXIS - Main Export
 *
 * Micro-composites + Composites + Motion + ActionSpec
 * This is the primary import for pages.
 */

// Micro-composites (domain semantics)
export * from "@/components/_internal/micro";

// Composites (workflow building blocks)
export * from "@/components/_internal/composites";

// ActionSpec system
export {
  renderActionSpec,
  renderActionSpecs,
  type ActionSpec,
} from "./action-spec";

// Motion tokens
export { motion, enter, exit, transition, duration, stagger, staggerStyle } from "@/lib/motion-tokens";

// Types
export type { AxisProps } from "@/lib/types/axis-props";
