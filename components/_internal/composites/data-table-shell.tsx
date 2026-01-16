/**
 * DataTableShell Composite
 *
 * Standard data table pattern (list + filter + paginate).
 * Accepts table prop (caller supplies Table rendering) to avoid TanStack lock-in.
 * Toolbar slots are pass-through (ReactNode allowed, dev-supplied).
 */

import React from "react";
import { Skeleton } from "@/components/primitives";
import { AxisProps } from "@/lib/types/axis-props";
import { cn } from "@/lib/utils";

export interface DataTableShellProps
  extends AxisProps<{
    table: React.ReactNode;
    isLoading?: boolean;
    count?: number;
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;
    pagination?: React.ReactNode;
  }> {}

/**
 * DataTableShell component
 *
 * Standard table shell with toolbar, loading state, empty state, and pagination.
 *
 * @example
 * ```tsx
 * <DataTableShell
 *   table={<Table>...</Table>}
 *   isLoading={loading}
 *   count={data.length}
 *   toolbarRight={<Button>New Request</Button>}
 *   emptyTitle="No requests yet"
 *   emptyDescription="Start by creating the first request."
 *   emptyAction={<Button>Create request</Button>}
 * />
 * ```
 */
export function DataTableShell({
  table,
  isLoading,
  count,
  toolbarLeft,
  toolbarRight,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your filters or create a new record.",
  emptyAction,
  pagination,
}: DataTableShellProps) {
  return (
    <div className="space-y-4">
      {(toolbarLeft || toolbarRight || count !== undefined) && (
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {toolbarLeft}
            {count !== undefined && (
              <span className="text-sm text-muted-foreground">
                {count} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">{toolbarRight}</div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          {table}
          {pagination && (
            <div className="flex items-center justify-between px-6 py-4">
              {pagination}
            </div>
          )}
        </>
      )}
    </div>
  );
}
