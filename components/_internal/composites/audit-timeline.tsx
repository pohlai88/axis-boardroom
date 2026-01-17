/**
 * AuditTimeline Composite
 *
 * Shows who did what when (audit trail, changelog).
 * Read-only, chronological display. All data passed as props, no mutations.
 * Uses devAssert for Zod validation and SafeText for XSS prevention.
 */

import React from "react";
import { Card, Skeleton } from "@/components/primitives";
import { AxisProps } from "@/lib/shared/types/axis-props";
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { AuditEventSchema, type AuditEvent } from "@/lib/client/zod/domain";
import { SafeText } from "@/lib/shared/utils/safe-text";
import { format } from "date-fns";
import { cn } from "@/lib/core/utils";

export interface AuditTimelineProps
  extends AxisProps<{
    events: AuditEvent[];
    isLoading?: boolean;
    headerSlot?: React.ReactNode;
    renderIcon?: (event: AuditEvent) => React.ReactNode;
    renderDetails?: (event: AuditEvent) => React.ReactNode;
  }> {}

/**
 * AuditTimeline component
 *
 * Displays chronological audit trail of events.
 *
 * @example
 * ```tsx
 * <AuditTimeline
 *   events={auditLog}
 *   renderIcon={(event) => <StatusBadge status={event.action} />}
 *   renderDetails={(event) => <p className="text-sm">{event.details}</p>}
 * />
 * ```
 */
export function AuditTimeline({
  events,
  isLoading,
  headerSlot,
  renderIcon,
  renderDetails,
}: AuditTimelineProps) {
  // Validate events in dev
  events.forEach((event, idx) => {
    devAssert(AuditEventSchema, event, `AuditTimeline.events[${idx}]`);
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        {headerSlot}
      </div>

      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            {idx !== events.length - 1 && (
              <div className="absolute left-4 top-12 w-0.5 h-12 bg-border" />
            )}

            {/* Event dot */}
            <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              {renderIcon ? (
                renderIcon(event)
              ) : (
                <span className="w-3 h-3 rounded-full bg-background" />
              )}
            </div>

            {/* Event details */}
            <div className="flex-1 pt-1">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">
                  {event.actor.name}
                  <span className="text-muted-foreground ml-2 font-normal">
                    {event.action}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(event.timestamp, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {event.actor.role}
              </p>
              {renderDetails
                ? renderDetails(event)
                : event.details && (
                    <div className="mt-2">
                      <SafeText
                        as="p"
                        className="text-sm text-muted-foreground italic"
                      >
                        {event.details}
                      </SafeText>
                    </div>
                  )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
