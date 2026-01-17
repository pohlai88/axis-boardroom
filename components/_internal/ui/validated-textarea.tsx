/**
 * ValidatedTextarea Component
 * 
 * Reusable textarea field component that integrates with React Hook Form
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
import { Textarea, type TextareaProps } from "./textarea";
import { cn } from "@/lib/core/utils";

export interface ValidatedTextareaProps extends Omit<TextareaProps, "name"> {
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
 * ValidatedTextarea component
 * 
 * Textarea field with automatic validation error display.
 * Must be used within a FormProvider context.
 * 
 * @example
 * ```tsx
 * <Form {...form}>
 *   <ValidatedTextarea
 *     name="description"
 *     label="Description"
 *     description="Provide a detailed description"
 *     rows={4}
 *     required
 *   />
 * </Form>
 * ```
 */
export function ValidatedTextarea({
  name,
  label,
  description,
  required,
  className,
  ...props
}: ValidatedTextareaProps) {
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
            <Textarea {...field} {...props} className={className} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
