/**
 * ErrorDisplay Component
 * 
 * Standardized error display component for ApiResult errors.
 * Renders errors consistently across the application.
 */

"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/primitives";
import { AlertCircle, XCircle, ShieldAlert, Ban } from "lucide-react";
import type { ApiError } from "@/lib/contracts";
import { getErrorMessage, formatValidationIssues } from "@/lib/client/utils/error-handler";
import { cn } from "@/lib/core/utils";

export interface ErrorDisplayProps {
  /** API error to display */
  error: ApiError;
  /** Title for the error (defaults to error code) */
  title?: string;
  /** Whether to show validation issues */
  showIssues?: boolean;
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
function getErrorIcon(code: ApiError["code"]) {
  switch (code) {
    case "VALIDATION_ERROR":
      return XCircle;
    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
      return ShieldAlert;
    case "NOT_FOUND":
      return AlertCircle;
    case "CONFLICT":
      return Ban;
    default:
      return AlertCircle;
  }
}

/**
 * Get variant class for error code
 */
function getErrorVariant(code: ApiError["code"]): "default" | "destructive" {
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
      return "destructive";
    default:
      return "destructive";
  }
}

/**
 * ErrorDisplay component
 * 
 * Displays API errors in a consistent, user-friendly format.
 * 
 * @example
 * ```tsx
 * const result = await createTask(data);
 * if (!result.ok) {
 *   return <ErrorDisplay error={result.error} />;
 * }
 * ```
 */
export function ErrorDisplay({
  error,
  title,
  showIssues = true,
  className,
  variant = "default",
  showIcon = true,
}: ErrorDisplayProps) {
  const message = getErrorMessage(error);
  const issues = formatValidationIssues(error.issues);
  const Icon = showIcon ? getErrorIcon(error.code) : null;
  const alertVariant = getErrorVariant(error.code);

  if (variant === "inline") {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        {showIcon && Icon && (
          <Icon className="inline h-4 w-4 mr-1 align-middle" />
        )}
        <span>{message}</span>
        {showIssues && error.issues && error.issues.length > 0 && (
          <ul className="mt-1 ml-5 list-disc text-xs">
            {error.issues.map((issue, index) => (
              <li key={index}>
                {issue.path.length > 0 && (
                  <span className="font-medium">{issue.path.join(".")}: </span>
                )}
                {issue.message}
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
          <span>{message}</span>
        </div>
        {showIssues && error.issues && error.issues.length > 0 && (
          <ul className="mt-2 ml-6 list-disc text-xs text-muted-foreground">
            {error.issues.map((issue, index) => (
              <li key={index}>
                {issue.path.length > 0 && (
                  <span className="font-medium">{issue.path.join(".")}: </span>
                )}
                {issue.message}
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
      <AlertTitle>{title || error.code.replace(/_/g, " ")}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{message}</p>
          {showIssues && error.issues && error.issues.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {error.issues.map((issue, index) => (
                  <li key={index}>
                    {issue.path.length > 0 && (
                      <span className="font-medium">{issue.path.join(".")}: </span>
                    )}
                    {issue.message}
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
 * ValidationIssuesDisplay Component
 * 
 * Displays validation issues grouped by field.
 * Useful for form error display.
 */
export interface ValidationIssuesDisplayProps {
  issues: ApiError["issues"];
  className?: string;
}

export function ValidationIssuesDisplay({
  issues,
  className,
}: ValidationIssuesDisplayProps) {
  if (!issues || issues.length === 0) {
    return null;
  }

  const grouped = formatValidationIssues(issues);

  return (
    <div className={cn("space-y-2", className)}>
      {Object.entries(grouped).map(([path, messages]) => (
        <div key={path} className="text-sm text-destructive">
          <span className="font-medium">{path === "root" ? "Form" : path}:</span>{" "}
          {messages.join(", ")}
        </div>
      ))}
    </div>
  );
}
