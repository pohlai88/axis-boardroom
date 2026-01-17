/**
 * ValidatedInput Component
 * 
 * Reusable input field component that integrates with React Hook Form
 * and automatically displays validation errors from Zod schemas.
 */

"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Input, type InputProps } from "./input";
import { cn } from "@/lib/core/utils";

export interface ValidatedInputProps extends Omit<InputProps, "name"> {
  /** Field name (must match form schema) */
  name: string;
  /** Field label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Whether field is required (for visual indicator) */
  required?: boolean;
}

/**
 * ValidatedInput component
 * 
 * Input field with automatic validation error display.
 * Must be used within a FormProvider context.
 * 
 * @example
 * ```tsx
 * <Form {...form}>
 *   <ValidatedInput
 *     name="email"
 *     label="Email Address"
 *     type="email"
 *     description="We'll never share your email"
 *     required
 *   />
 * </Form>
 * ```
 */
export function ValidatedInput({
  name,
  label,
  description,
  required,
  className,
  ...props
}: ValidatedInputProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} {...props} className={className} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
