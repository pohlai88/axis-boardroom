/**
 * PageHeader Composite
 *
 * Universal page top with title + actions.
 * Uses ActionSpec for actions (not ReactNode) to prevent injection.
 * Layout enforcement: title left, actions right, meta under title.
 */

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Progress,
} from "@/components/primitives";
import {
  renderActionSpecs,
  type ActionSpec,
} from "@/components/axis/action-spec"; // Direct import OK - action-spec has no deps on composites
import { AxisProps } from "@/lib/types/axis-props";
import { typography } from "@/lib/typography";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

type PageHeaderTone = "default" | "subtle";
type PageHeaderAlign = "top" | "center";
type PageHeaderStatus = "idle" | "loading" | "error" | "success";

export interface PageHeaderProps
  extends AxisProps<{
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ActionSpec[];
    metaSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    status?: PageHeaderStatus;
    variant?: "default" | "compact";
    tone?: PageHeaderTone;
    align?: PageHeaderAlign;
  }> {}

/**
 * PageHeader component
 *
 * Standard page header with title, breadcrumbs, actions, and status.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Requests"
 *   breadcrumbs={[{ label: "Home" }, { label: "Requests" }]}
 *   actions={[
 *     { kind: "button", key: "create", label: "New Request", onClick: handleCreate },
 *   ]}
 *   metaSlot={<StatusBadge status="pending" />}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  metaSlot,
  rightSlot,
  status = "idle",
  variant = "default",
  tone = "default",
}: PageHeaderProps) {
  const spacing = variant === "compact" ? "py-3" : "py-4";
  const bgClass = tone === "subtle" ? "bg-muted/50" : "bg-background";

  return (
    <div className={cn("border-b", bgClass, "px-6", spacing)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <BreadcrumbItem>
                      {idx === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <h1 className={cn(typography.h1, "mt-2")}>{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
          {metaSlot && <div className="mt-2">{metaSlot}</div>}
        </div>
        <div className="flex items-center gap-2">
          {actions && renderActionSpecs(actions)}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
      </div>
      {status === "loading" && <Progress value={30} className="mt-4" />}
    </div>
  );
}
