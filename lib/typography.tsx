/**
 * Typography Scale
 * Consistent typography system for AXIS
 */

import React from "react";
import { cn } from "@/lib/utils";

export const typography = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  body: "text-sm",
  bodyLarge: "text-base",
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium",
} as const;

export function Heading1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={cn(typography.h1, className)}>{children}</h1>;
}

export function Heading2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn(typography.h2, className)}>{children}</h2>;
}

export function Heading3({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn(typography.h3, className)}>{children}</h3>;
}

export function Body({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(typography.body, className)}>{children}</p>;
}

export function Caption({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(typography.caption, className)}>{children}</p>;
}
