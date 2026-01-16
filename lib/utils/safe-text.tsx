/**
 * SafeText Component
 *
 * XSS prevention utility for user-provided content.
 * Ensures plain text rendering (no dangerouslySetInnerHTML).
 *
 * Used for: comment, details, description props that come from DB/user.
 */

import React from "react";

interface SafeTextProps {
  /**
   * Plain text content to render safely
   */
  children: string;
  /**
   * Optional className for styling (applied to wrapper)
   */
  className?: string;
  /**
   * HTML tag to use (default: span)
   */
  as?: "span" | "p" | "div";
}

/**
 * SafeText component - renders plain text safely
 *
 * @example
 * ```tsx
 * <SafeText>{userComment}</SafeText>
 * <SafeText as="p" className="text-sm">{event.details}</SafeText>
 * ```
 */
export function SafeText({
  children,
  className,
  as: Component = "span",
}: SafeTextProps) {
  // Escape HTML entities to prevent XSS
  const escaped = children
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return <Component className={className}>{escaped}</Component>;
}
