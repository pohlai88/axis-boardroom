/**
 * Form Issue Mapper Utility
 * Maps server validation issues back to form fields
 */

import type { FieldValues, UseFormSetError } from "react-hook-form"
import type { ApiIssue } from "@/lib/contracts"

/**
 * Apply server validation issues to form fields
 * Maps API issues to React Hook Form field errors
 */
export function applyServerIssuesToForm<T extends FieldValues>(
  setError: UseFormSetError<T>,
  issues?: ApiIssue[]
) {
  if (!issues?.length) return

  for (const issue of issues) {
    const field = issue.path?.[0]
    if (typeof field === "string") {
      setError(field as any, { message: issue.message })
    }
  }
}
