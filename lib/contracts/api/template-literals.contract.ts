/**
 * Template Literal Schemas
 * 
 * Type-safe string patterns using Zod 4 template literals.
 * Useful for CSS units, API versions, color codes, etc.
 */

import { z } from "zod";

/**
 * CSS Unit Schema
 * 
 * Validates CSS units like "16px", "1.5rem", "100%"
 */
export const cssUnitSchema = z.templateLiteral([
  z.number(),
  z.enum(["px", "em", "rem", "%", "vh", "vw"]),
]).meta({
  description: "CSS unit value",
  example: "16px",
});

export type CssUnit = z.infer<typeof cssUnitSchema>;

/**
 * API Version Schema
 * 
 * Validates API version strings like "v1", "v2", "v10"
 */
export const apiVersionSchema = z.templateLiteral([
  "v",
  z.number(),
]).meta({
  description: "API version string",
  example: "v1",
});

export type ApiVersion = z.infer<typeof apiVersionSchema>;

/**
 * Color Code Schema
 * 
 * Validates hex color codes like "#ff0000"
 */
export const hexColorSchema = z.templateLiteral([
  "#",
  z.string().length(6).regex(/^[0-9a-fA-F]{6}$/),
]).meta({
  description: "Hex color code",
  example: "#ff0000",
});

export type HexColor = z.infer<typeof hexColorSchema>;

/**
 * ID with Prefix Schema
 * 
 * Validates IDs with prefixes like "task_123", "user_456"
 */
export const prefixedIdSchema = z.templateLiteral([
  z.enum(["task", "user", "org", "team"]),
  "_",
  z.string().min(1),
]).meta({
  description: "Prefixed identifier",
  example: "task_123",
});

export type PrefixedId = z.infer<typeof prefixedIdSchema>;
