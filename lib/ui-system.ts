/**
 * UI Design System Utilities
 *
 * Provides consistent spacing, typography, and layout patterns
 */

/**
 * Typography Scale
 * Consistent heading and text sizes
 */
export const typography = {
  h1: "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs leading-5 text-muted-foreground",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
} as const;

/**
 * Spacing Scale
 * Consistent spacing patterns for sections, grids, and cards
 */
export const spacing = {
  // Section spacing (vertical)
  section: "space-y-6",
  sectionTight: "space-y-4",
  sectionRelaxed: "space-y-8",

  // Grid gaps
  grid: "gap-4",
  gridTight: "gap-2",
  gridRelaxed: "gap-6",

  // Card padding
  card: "p-6",
  cardTight: "p-4",
  cardRelaxed: "p-8",

  // Form spacing
  form: "space-y-4",
  formGroup: "space-y-2",

  // Stack spacing (horizontal)
  stack: "flex gap-4",
  stackTight: "flex gap-2",
  stackRelaxed: "flex gap-6",
} as const;

/**
 * Layout Patterns
 * Common layout structures
 */
export const layout = {
  // Container widths
  container: "container mx-auto px-4",
  containerNarrow: "max-w-2xl mx-auto px-4",
  containerWide: "max-w-7xl mx-auto px-4",

  // Page layouts
  page: "min-h-screen py-8 px-4",
  pageSection: "py-12 px-4",

  // Card layouts
  cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  cardList: "space-y-4",

  // Flex layouts
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-start justify-between",
} as const;

/**
 * Animation Durations
 * Consistent timing for transitions
 */
export const duration = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
} as const;
