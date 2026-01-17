/**
 * FilterBar Composite
 *
 * Standard way to filter lists (search + status + date range).
 * Uses ActionSpec for actions (not ReactNode) to prevent injection.
 * Single-row layout (mobile wraps, no redesign).
 */

import React from "react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives";
import {
  renderActionSpecs,
  type ActionSpec,
} from "@/components/axis/action-spec"; // Direct import OK - action-spec has no deps on composites
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { FilterBarPropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";

export interface StatusOption {
  value: string;
  label: string;
}

export interface FilterBarProps
  extends AxisProps<{
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    statusValue?: string;
    statusOptions?: StatusOption[];
    onStatusChange?: (value: string) => void;
    actions?: ActionSpec[];
    leftSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    density?: "default" | "compact";
  }> {}

/**
 * FilterBar component
 *
 * Standard filter bar with search, status filter, and actions.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   searchPlaceholder="Search requests..."
 *   statusValue={status}
 *   statusOptions={[
 *     { value: "pending", label: "Pending" },
 *     { value: "approved", label: "Approved" },
 *   ]}
 *   onStatusChange={setStatus}
 *   actions={[
 *     { kind: "button", key: "clear", label: "Clear All", onClick: handleClear },
 *   ]}
 * />
 * ```
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusValue,
  statusOptions,
  onStatusChange,
  actions,
  leftSlot,
  rightSlot,
  density = "default",
}: FilterBarProps) {
  // Validate props in dev
  devAssert(
    FilterBarPropsSchema,
    { searchValue, searchPlaceholder, statusValue, statusOptions, density },
    "FilterBarProps"
  );

  const padding = density === "compact" ? "py-3" : "py-4";

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-6 border-b",
        padding,
        "flex-wrap"
      )}
    >
      {leftSlot && <div>{leftSlot}</div>}

      <Input
        placeholder={searchPlaceholder}
        value={searchValue ?? ""}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="flex-1 max-w-xs"
      />

      {statusOptions && statusOptions.length > 0 && (
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1" />

      {actions && (
        <div className="flex items-center gap-2">{renderActionSpecs(actions)}</div>
      )}

      {rightSlot && <div>{rightSlot}</div>}
    </div>
  );
}
