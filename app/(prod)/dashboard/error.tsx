"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/axis";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        preset="error"
        title="Failed to load dashboard"
        description={error.message || "An error occurred while loading the dashboard."}
        action={{
          label: "Try again",
          onClick: reset,
          variant: "default",
        }}
      />
    </div>
  );
}
