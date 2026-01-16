/**
 * AXIS Design Tokens - Master File
 * Single source of truth for all design decisions
 *
 * Based on: Tailwind 4, shadcn/ui, WCAG 2.1 AA
 * Philosophy: Token-first, semantic, accessible
 */

import {
  typography as typographyBase,
  spacing as spacingBase,
  layout as layoutBase,
  duration as durationBase,
} from "./ui-system";

export const typography = typographyBase;
export const spacing = spacingBase;
export const layout = layoutBase;
export const duration = durationBase;

// ============================================
// Shadows & Elevation
// ============================================

export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
} as const;

// ============================================
// Border Radius
// ============================================

export const radius = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
} as const;

// ============================================
// Transitions & Animations
// ============================================

export const transitions = {
  none: "transition-none",
  all: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  opacity: "transition-opacity duration-300 ease-in-out",
  shadow: "transition-shadow duration-300 ease-in-out",
  transform: "transition-transform duration-300 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-500 ease-in-out",
} as const;

// ============================================
// Domain-Specific Tokens (Business Logic)
// ============================================

/**
 * Status Colors
 * Used for request statuses in AXIS
 */
export const statusStyles = {
  pending: "bg-status-pending text-white",
  approved: "bg-status-approved text-white",
  rejected: "bg-status-rejected text-white",
  draft: "bg-status-draft text-white",
  cancelled: "bg-status-cancelled text-white",
} as const;

export const statusTextColors = {
  pending: "text-status-pending",
  approved: "text-status-approved",
  rejected: "text-status-rejected",
  draft: "text-status-draft",
  cancelled: "text-status-cancelled",
} as const;

export const statusBgSubtle = {
  pending:
    "bg-status-pending/10 text-status-pending border border-status-pending/20",
  approved:
    "bg-status-approved/10 text-status-approved border border-status-approved/20",
  rejected:
    "bg-status-rejected/10 text-status-rejected border border-status-rejected/20",
  draft: "bg-status-draft/10 text-status-draft border border-status-draft/20",
  cancelled:
    "bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20",
} as const;

/**
 * Priority Colors
 * Used for task/request priority levels
 */
export const priorityStyles = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-primary text-primary-foreground",
  low: "bg-muted text-muted-foreground",
} as const;

/**
 * Role Colors
 * Used for user role badges
 */
export const roleStyles = {
  ceo: "bg-purple-600 text-white",
  manager: "bg-primary text-primary-foreground",
  contributor: "bg-secondary text-secondary-foreground",
  user: "bg-secondary text-secondary-foreground",
} as const;

// ============================================
// Alias exports for composites (align with docs)
// ============================================

/**
 * Status classes (alias for statusStyles)
 * Used by micro-composites and composites
 */
export const statusClasses = statusStyles;

/**
 * Priority classes (alias for priorityStyles)
 * Used by micro-composites and composites
 */
export const priorityClasses = priorityStyles;

/**
 * Role classes (alias for roleStyles)
 * Used by micro-composites and composites
 */
export const roleClasses = roleStyles;

// ============================================
// Component Variants
// ============================================

/**
 * Button Sizes
 * Consistent button sizing across app
 */
export const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-8 text-base",
  icon: "h-10 w-10",
} as const;

/**
 * Input Sizes
 * Consistent input sizing
 */
export const inputSizes = {
  sm: "h-8 text-xs px-3",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
} as const;

// ============================================
// Z-Index Scale
// ============================================

export const zIndex = {
  base: "z-0",
  dropdown: "z-10",
  sticky: "z-20",
  fixed: "z-30",
  modalBackdrop: "z-40",
  modal: "z-50",
  popover: "z-50",
  tooltip: "z-60",
} as const;

// ============================================
// Breakpoints (from Tailwind)
// ============================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// Container Widths
// ============================================

export const containers = {
  sm: "max-w-screen-sm", // 640px
  md: "max-w-screen-md", // 768px
  lg: "max-w-screen-lg", // 1024px
  xl: "max-w-screen-xl", // 1280px
  "2xl": "max-w-screen-2xl", // 1536px
  full: "max-w-full",
} as const;

// ============================================
// Export all as single object for flexibility
// ============================================

export const designTokens = {
  typography,
  spacing,
  layout,
  shadows,
  radius,
  transitions,
  duration,
  statusStyles,
  statusTextColors,
  statusBgSubtle,
  priorityStyles,
  roleStyles,
  buttonSizes,
  inputSizes,
  zIndex,
  breakpoints,
  containers,
} as const;

// ============================================
// Type Exports
// ============================================

export type DesignTokens = typeof designTokens;
export type TypographyToken = keyof typeof typography;
export type SpacingToken = keyof typeof spacing;
export type LayoutToken = keyof typeof layout;
export type ShadowToken = keyof typeof shadows;
export type RadiusToken = keyof typeof radius;
export type TransitionToken = keyof typeof transitions;
export type StatusToken = keyof typeof statusStyles;
export type PriorityToken = keyof typeof priorityStyles;
export type RoleToken = keyof typeof roleStyles;
