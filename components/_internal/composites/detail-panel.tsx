/**
 * DetailPanel Composite
 *
 * Read-only detail display with labeled fields.
 * Used for displaying entity details in a consistent format.
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { DetailPanelPropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";
import { motion } from "@/lib/design/motion";

export interface DetailField {
  /** Field label */
  label: string;
  /** Field value (string, number, or ReactNode for badges) */
  value: React.ReactNode;
  /** Whether value is empty/null */
  isEmpty?: boolean;
  /** Span full width (2 columns) */
  fullWidth?: boolean;
  /** Whether this field is loading */
  loading?: boolean;
}

export interface DetailPanelProps
  extends AxisProps<{
    /** Panel title */
    title: string;
    /** Panel description */
    description?: string;
    /** Array of fields to display */
    fields: DetailField[];
    /** Whether panel is loading */
    loading?: boolean;
    /** Number of columns */
    columns?: 1 | 2 | 3;
    /** Visual variant */
    variant?: "card" | "plain" | "bordered";
    /** Header slot (e.g., for status badge) */
    headerSlot?: React.ReactNode;
    /** Footer slot (e.g., for actions) */
    footerSlot?: React.ReactNode;
    /** Whether to animate */
    animate?: boolean;
  }> {}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

function FieldDisplay({ field }: { field: DetailField }) {
  if (field.loading) {
    return <FieldSkeleton />;
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">
        {field.label}
      </dt>
      <dd className={cn(
        "text-sm",
        field.isEmpty && "text-muted-foreground italic"
      )}>
        {field.isEmpty ? "—" : field.value}
      </dd>
    </div>
  );
}

/**
 * DetailPanel component
 *
 * Displays entity details in a consistent labeled format.
 *
 * @example
 * ```tsx
 * <DetailPanel
 *   title="Request Details"
 *   fields={[
 *     { label: "Title", value: request.title },
 *     { label: "Status", value: <StatusBadge status={request.status} /> },
 *     { label: "Description", value: request.body, fullWidth: true },
 *   ]}
 *   headerSlot={<StatusBadge status={request.status} />}
 * />
 * ```
 */
export function DetailPanel({
  title,
  description,
  fields,
  loading = false,
  columns = 2,
  variant = "card",
  headerSlot,
  footerSlot,
  animate = true,
}: DetailPanelProps) {
  // Validate props in dev
  devAssert(
    DetailPanelPropsSchema,
    { title, description, fields, loading, columns, variant, animate },
    "DetailPanelProps"
  );

  const gridClasses = cn(
    "grid gap-4",
    columns === 1 && "grid-cols-1",
    columns === 2 && "grid-cols-1 sm:grid-cols-2",
    columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  );

  const content = (
    <dl className={gridClasses}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <FieldSkeleton key={i} />
          ))
        : fields.map((field, index) => (
            <div
              key={index}
              className={cn(
                field.fullWidth && columns > 1 && "sm:col-span-2",
                field.fullWidth && columns === 3 && "lg:col-span-3"
              )}
            >
              <FieldDisplay field={field} />
            </div>
          ))}
    </dl>
  );

  if (variant === "plain") {
    return (
      <div className={cn(animate && motion.enter.fadeIn)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {headerSlot}
        </div>
        {content}
        {footerSlot && (
          <>
            <Separator className="my-4" />
            {footerSlot}
          </>
        )}
      </div>
    );
  }

  if (variant === "bordered") {
    return (
      <div className={cn(
        "border rounded-lg p-4",
        animate && motion.enter.fadeIn
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {headerSlot}
        </div>
        {content}
        {footerSlot && (
          <>
            <Separator className="my-4" />
            {footerSlot}
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(animate && motion.enter.fadeIn)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerSlot}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
      {footerSlot && (
        <>
          <Separator />
          <div className="p-6">{footerSlot}</div>
        </>
      )}
    </Card>
  );
}
