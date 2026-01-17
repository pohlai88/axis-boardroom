/**
 * StatCard Composite
 *
 * Dashboard statistic card with value, label, trend, and optional icon.
 * Used for KPIs and metrics display.
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { StatCardPropsSchema } from "@/lib/client/zod/composite-props";
import { cn } from "@/lib/core/utils";
import { motion } from "@/lib/design/motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  type LucideIcon 
} from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";
type StatCardSize = "sm" | "default" | "lg";

export interface StatCardProps
  extends AxisProps<{
    /** Stat label */
    label: string;
    /** Stat value */
    value: string | number;
    /** Trend info */
    trend?: {
      direction: TrendDirection;
      value: string;
      label?: string;
    };
    /** Icon to display */
    icon?: LucideIcon;
    /** Whether the stat is loading */
    loading?: boolean;
    /** Size variant */
    size?: StatCardSize;
    /** Whether to highlight (e.g., primary stat) */
    highlight?: boolean;
    /** Click handler (makes card interactive) */
    onClick?: () => void;
    /** Description below value */
    description?: string;
    /** Whether to animate */
    animate?: boolean;
  }> {}

const trendColors: Record<TrendDirection, string> = {
  up: "text-green-600 dark:text-green-500",
  down: "text-red-600 dark:text-red-500",
  neutral: "text-muted-foreground",
};

const TrendIcon: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/**
 * StatCard component
 *
 * Displays a single statistic with optional trend indicator.
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Requests"
 *   value={1234}
 *   trend={{ direction: "up", value: "+12%", label: "vs last month" }}
 *   icon={FileText}
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  loading = false,
  size = "default",
  highlight = false,
  onClick,
  description,
  animate = true,
}: StatCardProps) {
  // Validate props in dev
  devAssert(
    StatCardPropsSchema,
    { label, value, trend, loading, size, highlight, description, animate },
    "StatCardProps"
  );

  const TrendIconComponent = trend ? TrendIcon[trend.direction] : null;

  const valueClasses = cn(
    "font-bold tabular-nums",
    size === "sm" && "text-xl",
    size === "default" && "text-2xl",
    size === "lg" && "text-3xl"
  );

  const iconClasses = cn(
    "text-muted-foreground",
    size === "sm" && "h-4 w-4",
    size === "default" && "h-5 w-5",
    size === "lg" && "h-6 w-6"
  );

  const cardClasses = cn(
    animate && motion.enter.fadeIn,
    onClick && cn(
      "cursor-pointer",
      motion.transition.lift
    ),
    highlight && "border-primary bg-primary/5"
  );

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "font-medium",
          size === "sm" && "text-xs",
          size === "default" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {label}
        </CardTitle>
        {Icon && <Icon className={iconClasses} />}
      </CardHeader>
      <CardContent>
        <div className={valueClasses}>{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        
        {trend && TrendIconComponent && (
          <div className={cn(
            "flex items-center gap-1 mt-1",
            trendColors[trend.direction]
          )}>
            <TrendIconComponent className="h-3 w-3" />
            <span className="text-xs font-medium">{trend.value}</span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * StatCardGrid - Helper for displaying multiple stat cards
 */
export interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatCardGrid({ children, columns = 4 }: StatCardGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      {children}
    </div>
  );
}
