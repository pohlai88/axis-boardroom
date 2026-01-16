/**
 * Composites - AXIS Core Building Blocks
 *
 * Page layout, data display, forms, and feedback composites.
 */

// Page Layout
export {
  PageHeader,
  type PageHeaderProps,
  type BreadcrumbItem,
} from "./page-header";
export { FilterBar, type FilterBarProps, type StatusOption } from "./filter-bar";

// Data Display
export { DataTableShell, type DataTableShellProps } from "./data-table-shell";
export { DetailPanel, type DetailPanelProps, type DetailField } from "./detail-panel";
export { StatCard, StatCardGrid, type StatCardProps, type StatCardGridProps } from "./stat-card";
export { AuditTimeline, type AuditTimelineProps } from "./audit-timeline";

// Forms & Actions
export { FormShell, type FormShellProps } from "./form-shell";
export { ApprovalPanel, type ApprovalPanelProps } from "./approval-panel";

// Feedback & States
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { ConfirmDialog, useConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
