/**
 * Composite Component Props Schemas
 *
 * Zod schemas for validating composite component props in development.
 * Used with devAssert utility for zero-cost production validation.
 */

import { z } from "zod";

/**
 * ConfirmDialog Props Schema
 */
export const ConfirmDialogPropsSchema = z.object({
  open: z.boolean(),
  title: z.string().min(1),
  description: z.string().min(1),
  confirmLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  variant: z.enum(["default", "destructive", "warning", "info"]).optional(),
  loading: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

/**
 * DataTableShell Props Schema
 */
export const DataTableShellPropsSchema = z.object({
  isLoading: z.boolean().optional(),
  count: z.number().optional(),
  emptyTitle: z.string().optional(),
  emptyDescription: z.string().optional(),
});

/**
 * DetailField Schema
 */
export const DetailFieldSchema = z.object({
  label: z.string().min(1),
  isEmpty: z.boolean().optional(),
  fullWidth: z.boolean().optional(),
  loading: z.boolean().optional(),
});

/**
 * DetailPanel Props Schema
 */
export const DetailPanelPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(DetailFieldSchema).min(1),
  loading: z.boolean().optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  variant: z.enum(["card", "plain", "bordered"]).optional(),
  animate: z.boolean().optional(),
});

/**
 * EmptyState Props Schema
 */
export const EmptyStatePropsSchema = z.object({
  preset: z.enum(["no-data", "no-results", "no-access", "error", "custom"]).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  action: z.object({
    label: z.string().min(1),
    variant: z.enum(["default", "outline", "ghost"]).optional(),
  }).optional(),
  secondaryAction: z.object({
    label: z.string().min(1),
  }).optional(),
  variant: z.enum(["default", "compact", "card"]).optional(),
  animate: z.boolean().optional(),
});

/**
 * StatusOption Schema
 */
export const StatusOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

/**
 * FilterBar Props Schema
 */
export const FilterBarPropsSchema = z.object({
  searchValue: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  statusValue: z.string().optional(),
  statusOptions: z.array(StatusOptionSchema).optional(),
  density: z.enum(["default", "compact"]).optional(),
});

/**
 * FormShell Props Schema
 */
export const FormShellPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  state: z.enum(["idle", "loading", "success", "error"]).optional(),
  errorMessage: z.string().optional(),
  successMessage: z.string().optional(),
  submitLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  variant: z.enum(["card", "plain"]).optional(),
  disabled: z.boolean().optional(),
  footerAlign: z.enum(["left", "right", "between"]).optional(),
});

/**
 * BreadcrumbItem Schema
 */
export const BreadcrumbItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
});

/**
 * PageHeader Props Schema
 */
export const PageHeaderPropsSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  breadcrumbs: z.array(BreadcrumbItemSchema).optional(),
  status: z.enum(["idle", "loading", "error", "success"]).optional(),
  variant: z.enum(["default", "compact"]).optional(),
  tone: z.enum(["default", "subtle"]).optional(),
  align: z.enum(["top", "center"]).optional(),
});

/**
 * StatCard Trend Schema
 */
export const StatCardTrendSchema = z.object({
  direction: z.enum(["up", "down", "neutral"]),
  value: z.string().min(1),
  label: z.string().optional(),
});

/**
 * StatCard Props Schema
 */
export const StatCardPropsSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  trend: StatCardTrendSchema.optional(),
  loading: z.boolean().optional(),
  size: z.enum(["sm", "default", "lg"]).optional(),
  highlight: z.boolean().optional(),
  description: z.string().optional(),
  animate: z.boolean().optional(),
});
