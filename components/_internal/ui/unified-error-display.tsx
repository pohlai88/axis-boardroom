/**
 * UnifiedErrorDisplay Component
 * 
 * The single error display component that handles ALL error sources.
 * Accepts any error type and normalizes it to UiError for display.
 */

"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/primitives";
import { AlertCircle, XCircle, ShieldAlert, Ban, WifiOff } from "lucide-react";
import type { UiError } from "@/lib/contracts/errors/ui-error.contract";
import { normalizeError } from "@/lib/client/utils/error-normalizer";
import { cn } from "@/lib/core/utils";

export interface UnifiedErrorDisplayProps {
  /** Any error type - will be normalized automatically */
  error: unknown;
  /** Title override (optional) */
  title?: string;
  /** Whether to show field errors */
  showFieldErrors?: boolean;
  /** Additional className */
  className?: string;
  /** Variant style */
  variant?: "default" | "compact" | "inline";
  /** Whether to show icon */
  showIcon?: boolean;
}

/**
 * Get icon for error code
 */
function getErrorIcon(code?: string) {
  switch (code) {
    case "VALIDATION_ERROR":
    case "BAD_REQUEST":
      return XCircle;
    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
      return ShieldAlert;
    case "NOT_FOUND":
      return AlertCircle;
    case "CONFLICT":
      return Ban;
    case "NETWORK_ERROR":
      return WifiOff;
    default:
      return AlertCircle;
  }
}

/**
 * Get variant class for error code
 */
function getErrorVariant(code?: string): "default" | "destructive" {
  switch (code) {
    case "VALIDATION_ERROR":
    case "BAD_REQUEST":
      return "default";
    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
    case "NOT_FOUND":
    case "CONFLICT":
    case "INTERNAL":
    case "RATE_LIMIT_EXCEEDED":
    case "NETWORK_ERROR":
      return "destructive";
    default:
      return "destructive";
  }
}

/**
 * UnifiedErrorDisplay component
 * 
 * Accepts ANY error type and displays it consistently.
 * 
 * @example
 * ```tsx
 * // Works with ApiResult
 * const result = await createTask(data);
 * if (!result.ok) {
 *   return <UnifiedErrorDisplay error={result} />;
 * }
 * 
 * // Works with ZodError
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   return <UnifiedErrorDisplay error={error} />;
 * }
 * 
 * // Works with Better Auth errors
 * const { error } = await authClient.signIn.email(data);
 * if (error) {
 *   return <UnifiedErrorDisplay error={error} />;
 * }
 * 
 * // Works with Fetch errors
 * try {
 *   await fetch("/api/endpoint");
 * } catch (error) {
 *   return <UnifiedErrorDisplay error={error} />;
 * }
 * ```
 */
export function UnifiedErrorDisplay({
  error,
  title,
  showFieldErrors = true,
  className,
  variant = "default",
  showIcon = true,
}: UnifiedErrorDisplayProps) {
  // Normalize any error to UiError
  const uiError = normalizeError(error);
  const displayTitle = title || uiError.title;
  const Icon = showIcon ? getErrorIcon(uiError.code) : null;
  const alertVariant = getErrorVariant(uiError.code);

  if (variant === "inline") {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        {showIcon && Icon && (
          <Icon className="inline h-4 w-4 mr-1 align-middle" />
        )}
        <span>{uiError.message}</span>
        {showFieldErrors && uiError.fieldErrors && Object.keys(uiError.fieldErrors).length > 0 && (
          <ul className="mt-1 ml-5 list-disc text-xs">
            {Object.entries(uiError.fieldErrors).map(([field, message]) => (
              <li key={field}>
                <span className="font-medium">{field}: </span>
                {message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("text-sm", className)}>
        <div className="flex items-center gap-2 text-destructive">
          {showIcon && Icon && <Icon className="h-4 w-4" />}
          <span>{uiError.message}</span>
        </div>
        {showFieldErrors && uiError.fieldErrors && Object.keys(uiError.fieldErrors).length > 0 && (
          <ul className="mt-2 ml-6 list-disc text-xs text-muted-foreground">
            {Object.entries(uiError.fieldErrors).map(([field, message]) => (
              <li key={field}>
                <span className="font-medium">{field}: </span>
                {message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Alert variant={alertVariant} className={className}>
      {showIcon && Icon && <Icon className="h-4 w-4" />}
      <AlertTitle>{displayTitle}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{uiError.message}</p>
          {showFieldErrors && uiError.fieldErrors && Object.keys(uiError.fieldErrors).length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Object.entries(uiError.fieldErrors).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-medium">{field === "root" ? "Form" : `${field}: `}</span>
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * FieldErrorsDisplay Component
 * 
 * Displays field-level errors from UiError.
 * Useful for form error display.
 */
export interface FieldErrorsDisplayProps {
  fieldErrors: Record<string, string>;
  className?: string;
}

export function FieldErrorsDisplay({
  fieldErrors,
  className,
}: FieldErrorsDisplayProps) {
  if (Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Object.entries(fieldErrors).map(([field, message]) => (
        <div key={field} className="text-sm text-destructive">
          <span className="font-medium">{field === "root" ? "Form" : field}:</span>{" "}
          {message}
        </div>
      ))}
    </div>
  );
}
