/**
 * ValidatedCheckbox Component
 * 
 * Reusable checkbox field component that integrates with React Hook Form
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
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/core/utils";

export interface ValidatedCheckboxProps {
  /** Field name (must match form schema) */
  name: string;
  /** Field label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Whether field is required (for visual indicator) */
  required?: boolean;
  /** Whether checkbox is disabled */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ValidatedCheckbox component
 * 
 * Checkbox field with automatic validation error display.
 * Must be used within a FormProvider context.
 * 
 * @example
 * ```tsx
 * <Form {...form}>
 *   <ValidatedCheckbox
 *     name="terms"
 *     label="I agree to the terms and conditions"
 *     description="You must agree to continue"
 *     required
 *   />
 * </Form>
 * ```
 */
export function ValidatedCheckbox({
  name,
  label,
  description,
  required,
  disabled,
  className,
}: ValidatedCheckboxProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="cursor-pointer">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
