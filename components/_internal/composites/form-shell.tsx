/**
 * FormShell Composite
 *
 * Standard form wrapper with validation states, loading, and actions.
 * Enforces consistent form structure across the application.
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
} from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { FormShellPropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";
import { motion } from "@/lib/design/motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type FormShellState = "idle" | "loading" | "success" | "error";

export interface FormShellProps
  extends AxisProps<{
    /** Form title */
    title: string;
    /** Form description */
    description?: string;
    /** Form state */
    state?: FormShellState;
    /** Error message (shown when state is 'error') */
    errorMessage?: string;
    /** Success message (shown when state is 'success') */
    successMessage?: string;
    /** Form content */
    children: React.ReactNode;
    /** Primary submit action */
    onSubmit: (e: React.FormEvent) => void;
    /** Submit button label */
    submitLabel?: string;
    /** Cancel action */
    onCancel?: () => void;
    /** Cancel button label */
    cancelLabel?: string;
    /** Secondary actions (reset, etc.) */
    secondaryActions?: React.ReactNode;
    /** Whether to show card wrapper */
    variant?: "card" | "plain";
    /** Whether form is disabled */
    disabled?: boolean;
    /** Footer alignment */
    footerAlign?: "left" | "right" | "between";
  }> {}

/**
 * FormShell component
 *
 * Standard form structure with header, content, feedback, and actions.
 *
 * @example
 * ```tsx
 * <FormShell
 *   title="Create Request"
 *   description="Fill out the form to create a new request."
 *   state={formState}
 *   errorMessage={error}
 *   onSubmit={handleSubmit}
 *   onCancel={() => router.back()}
 * >
 *   <Input name="title" ... />
 *   <Textarea name="body" ... />
 * </FormShell>
 * ```
 */
export function FormShell({
  title,
  description,
  state = "idle",
  errorMessage,
  successMessage,
  children,
  onSubmit,
  submitLabel = "Submit",
  onCancel,
  cancelLabel = "Cancel",
  secondaryActions,
  variant = "card",
  disabled = false,
  footerAlign = "right",
}: FormShellProps) {
  // Validate props in dev
  devAssert(
    FormShellPropsSchema,
    { title, description, state, errorMessage, successMessage, submitLabel, cancelLabel, variant, disabled, footerAlign },
    "FormShellProps"
  );

  const isLoading = state === "loading";
  const isDisabled = disabled || isLoading;

  const footerClasses = cn(
    "flex gap-3",
    footerAlign === "left" && "justify-start",
    footerAlign === "right" && "justify-end",
    footerAlign === "between" && "justify-between"
  );

  const formContent = (
    <>
      {/* Feedback Messages */}
      {state === "error" && errorMessage && (
        <Alert variant="destructive" className={cn("mb-4", motion.enter.fadeIn)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {state === "success" && successMessage && (
        <Alert className={cn("mb-4 border-green-500/50 bg-green-500/10", motion.enter.fadeIn)}>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {children}
      </div>
    </>
  );

  const formFooter = (
    <div className={footerClasses}>
      {secondaryActions && (
        <div className="flex gap-2">
          {secondaryActions}
        </div>
      )}
      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isDisabled}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  if (variant === "plain") {
    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {formContent}
        {formFooter}
      </form>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
        <CardFooter className={footerClasses}>
          {formFooter}
        </CardFooter>
      </form>
    </Card>
  );
}
