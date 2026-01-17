/**
 * UI Components Index
 * Barrel export for validated form components and error display
 */

// Validated Form Components
export { ValidatedInput } from "./validated-input";
export { ValidatedTextarea } from "./validated-textarea";
export { ValidatedSelect } from "./validated-select";
export { ValidatedCheckbox } from "./validated-checkbox";

export type { ValidatedInputProps } from "./validated-input";
export type { ValidatedTextareaProps } from "./validated-textarea";
export type { ValidatedSelectProps, SelectOption } from "./validated-select";
export type { ValidatedCheckboxProps } from "./validated-checkbox";

// Error Display Components
export { ErrorDisplay, ValidationIssuesDisplay } from "./error-display";
export type { ErrorDisplayProps, ValidationIssuesDisplayProps } from "./error-display";

// Unified Error Display (Phase 5 - Recommended)
export { UnifiedErrorDisplay, FieldErrorsDisplay } from "./unified-error-display";
export type { UnifiedErrorDisplayProps, FieldErrorsDisplayProps } from "./unified-error-display";
