/**
 * Components Index
 *
 * Central export for AXIS components.
 * Use @/components/axis or @/components/primitives directly for better tree-shaking.
 */

// Re-export axis only (primitives overlap causes TS2308)
export * from "@/components/axis";
