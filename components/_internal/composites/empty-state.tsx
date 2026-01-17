/**
 * EmptyState Composite
 *
 * Zero-data placeholder with optional action.
 * Used when tables, lists, or sections have no content.
 */

import React from "react";
import { Button } from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { EmptyStatePropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";
import { motion } from "@/lib/design/motion";
import { type LucideIcon, Inbox, FileQuestion, Search, FolderOpen } from "lucide-react";

type EmptyStateVariant = "default" | "compact" | "card";
type EmptyStatePreset = "no-data" | "no-results" | "no-access" | "error" | "custom";

export interface EmptyStateProps
  extends AxisProps<{
    /** Preset determines icon and default text */
    preset?: EmptyStatePreset;
    /** Custom icon (overrides preset icon) */
    icon?: LucideIcon;
    /** Primary message */
    title: string;
    /** Secondary explanation */
    description?: string;
    /** Primary action */
    action?: {
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost";
    };
    /** Secondary action */
    secondaryAction?: {
      label: string;
      onClick: () => void;
    };
    /** Visual variant */
    variant?: EmptyStateVariant;
    /** Whether to animate in */
    animate?: boolean;
  }> {}

const presetIcons: Record<EmptyStatePreset, LucideIcon> = {
  "no-data": Inbox,
  "no-results": Search,
  "no-access": FolderOpen,
  "error": FileQuestion,
  "custom": Inbox,
};

/**
 * EmptyState component
 *
 * Standard empty state with icon, title, description, and actions.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   preset="no-data"
 *   title="No requests yet"
 *   description="Create your first request to get started."
 *   action={{ label: "Create Request", onClick: handleCreate }}
 * />
 * ```
 */
export function EmptyState({
  preset = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  animate = true,
}: EmptyStateProps) {
  // Validate props in dev
  devAssert(
    EmptyStatePropsSchema,
    { preset, title, description, action, secondaryAction, variant, animate },
    "EmptyStateProps"
  );

  const Icon = icon ?? presetIcons[preset];
  
  const containerClasses = cn(
    "flex flex-col items-center justify-center text-center",
    variant === "default" && "py-16 px-4",
    variant === "compact" && "py-8 px-4",
    variant === "card" && "py-12 px-6 bg-muted/30 rounded-lg border border-dashed",
    animate && motion.enter.fadeIn
  );

  const iconClasses = cn(
    "text-muted-foreground/50",
    variant === "compact" ? "h-10 w-10 mb-3" : "h-12 w-12 mb-4"
  );

  return (
    <div className={containerClasses}>
      <Icon className={iconClasses} />
      
      <h3 className={cn(
        "font-semibold text-foreground",
        variant === "compact" ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          "text-muted-foreground mt-1 max-w-sm",
          variant === "compact" ? "text-sm" : "text-sm"
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className={cn(
          "flex items-center gap-3",
          variant === "compact" ? "mt-4" : "mt-6"
        )}>
          {action && (
            <Button
              variant={action.variant ?? "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
