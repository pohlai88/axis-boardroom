/**
 * Auth Form Contracts
 * Form validation schemas for authentication forms
 * 
 * Note: Using non-branded email for form compatibility with React Hook Form
 * Branded types are used in API contracts for type safety
 */

import { z } from "zod/v4/mini";

// Email validation pattern (non-branded for form compatibility)
const emailValidation = z
  .string()
  .check(
    z.minLength(1, "Email is required"),
    z.email("Invalid email address"),
    z.toLowerCase(),
    z.trim()
  );

// Signup form schema with comprehensive password validation
export const signupFormSchema = z.object({
  name: z
    .string()
    .check(
      z.minLength(2, "Name must be at least 2 characters"),
      z.maxLength(50, "Name must be less than 50 characters"),
      z.trim()
    ),

  email: emailValidation,

  password: z
    .string()
    .check(
      z.minLength(8, "Password must be at least 8 characters"),
      z.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
      z.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
      z.regex(/[0-9]/, "Password must contain at least one number")
    ),
});

// Login form schema
export const loginFormSchema = z.object({
  email: emailValidation,
  password: z.string().check(z.minLength(1, "Password is required")),
});

// Magic link form schema
export const magicLinkFormSchema = z.object({
  email: emailValidation,
});

// Type exports
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkFormSchema>;
