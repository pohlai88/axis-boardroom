/**
 * Pattern Registry
 *
 * Linter-friendly manifest of AXIS page patterns.
 * Enables future tooling: docs generation, storybook pages, optional lint rules.
 */

export const AXIS_PATTERNS = {
  // List Pages
  RequestsList: ["PageHeader", "FilterBar", "DataTableShell", "EmptyState"],
  TodoList: ["PageHeader", "FilterBar", "DataTableShell", "EmptyState"],
  
  // Detail Pages
  RequestDetail: ["PageHeader", "DetailPanel", "ApprovalPanel", "AuditTimeline"],
  UserProfile: ["PageHeader", "DetailPanel", "StatCard"],
  
  // Form Pages
  CreateRequest: ["PageHeader", "FormShell"],
  EditRequest: ["PageHeader", "FormShell"],
  
  // Dashboard Pages
  Dashboard: ["PageHeader", "StatCard", "DataTableShell"],
  Analytics: ["PageHeader", "StatCard", "FilterBar"],
  
  // Settings Pages
  Settings: ["PageHeader", "FormShell", "ConfirmDialog"],
} as const;

export type PatternName = keyof typeof AXIS_PATTERNS;
export type PatternComponents = (typeof AXIS_PATTERNS)[PatternName];

/**
 * Get pattern components for a given pattern name
 */
export function getPatternComponents(pattern: PatternName): readonly string[] {
  return AXIS_PATTERNS[pattern];
}

/**
 * Check if a component is used in a pattern
 */
export function isComponentInPattern(component: string, pattern: PatternName): boolean {
  return AXIS_PATTERNS[pattern].includes(component as never);
}
