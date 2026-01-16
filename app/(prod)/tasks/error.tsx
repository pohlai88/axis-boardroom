"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/axis";
import { Button } from "@/components/primitives";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Tasks page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmptyState
        preset="error"
        title="Something went wrong"
        description={error.message || "An unexpected error occurred while loading tasks."}
        action={{
          label: "Try again",
          onClick: reset,
          variant: "default",
        }}
      />
    </div>
  );
}
