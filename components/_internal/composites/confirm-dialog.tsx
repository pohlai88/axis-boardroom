/**
 * ConfirmDialog Composite
 *
 * Standardized confirmation modal for destructive or important actions.
 * Uses AlertDialog under the hood with consistent styling.
 */

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { ConfirmDialogPropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";
import { AlertTriangle, Trash2, Info, type LucideIcon } from "lucide-react";

type ConfirmDialogVariant = "default" | "destructive" | "warning" | "info";

export interface ConfirmDialogProps
  extends AxisProps<{
    /** Whether dialog is open */
    open: boolean;
    /** Called when dialog should close */
    onOpenChange: (open: boolean) => void;
    /** Dialog title */
    title: string;
    /** Dialog description */
    description: string;
    /** Confirm button label */
    confirmLabel?: string;
    /** Cancel button label */
    cancelLabel?: string;
    /** Called when confirm is clicked */
    onConfirm: () => void;
    /** Called when cancel is clicked */
    onCancel?: () => void;
    /** Visual variant */
    variant?: ConfirmDialogVariant;
    /** Custom icon (overrides variant icon) */
    icon?: LucideIcon;
    /** Whether confirm action is loading */
    loading?: boolean;
    /** Whether confirm action is disabled */
    disabled?: boolean;
  }> {}

const variantIcons: Record<ConfirmDialogVariant, LucideIcon> = {
  default: Info,
  destructive: Trash2,
  warning: AlertTriangle,
  info: Info,
};

const variantIconColors: Record<ConfirmDialogVariant, string> = {
  default: "text-primary",
  destructive: "text-destructive",
  warning: "text-yellow-600 dark:text-yellow-500",
  info: "text-blue-600 dark:text-blue-500",
};

const variantButtonClasses: Record<ConfirmDialogVariant, string> = {
  default: "",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning: "bg-yellow-600 text-white hover:bg-yellow-700",
  info: "bg-blue-600 text-white hover:bg-blue-700",
};

/**
 * ConfirmDialog component
 *
 * Standardized confirmation dialog for actions that need user confirmation.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showDelete}
 *   onOpenChange={setShowDelete}
 *   title="Delete Request"
 *   description="Are you sure you want to delete this request? This action cannot be undone."
 *   variant="destructive"
 *   confirmLabel="Delete"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  // Validate props in dev
  devAssert(
    ConfirmDialogPropsSchema,
    { open, title, description, confirmLabel, cancelLabel, variant, loading, disabled },
    "ConfirmDialogProps"
  );

  const Icon = icon ?? variantIcons[variant];

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              variant === "destructive" && "bg-destructive/10",
              variant === "warning" && "bg-yellow-100 dark:bg-yellow-900/30",
              variant === "info" && "bg-blue-100 dark:bg-blue-900/30",
              variant === "default" && "bg-muted"
            )}>
              <Icon className={cn("h-5 w-5", variantIconColors[variant])} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || disabled}
            className={cn(variantButtonClasses[variant])}
          >
            {loading ? "Loading..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * useConfirmDialog hook
 *
 * Convenience hook for managing confirm dialog state.
 *
 * @example
 * ```tsx
 * const { dialog, confirm, cancel, isOpen } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Delete?",
 *     description: "This cannot be undone.",
 *     variant: "destructive",
 *   });
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 *
 * return <>{dialog}</>;
 * ```
 */
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm" | "onCancel"> | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    props: null,
    resolve: null,
  });

  const confirm = React.useCallback(
    (props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm" | "onCancel">) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          props,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState({ open: false, props: null, resolve: null });
  }, [state.resolve]);

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false);
    setState({ open: false, props: null, resolve: null });
  }, [state.resolve]);

  const dialog = state.props ? (
    <ConfirmDialog
      {...state.props}
      open={state.open}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return {
    dialog,
    confirm,
    cancel: handleCancel,
    isOpen: state.open,
  };
}
