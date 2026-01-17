/**
 * ValidatedSelect Component
 * 
 * Reusable select field component that integrates with React Hook Form
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidatedSelectProps {
  /** Field name (must match form schema) */
  name: string;
  /** Field label */
  label: string;
  /** Select options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Optional description/help text */
  description?: string;
  /** Whether field is required (for visual indicator) */
  required?: boolean;
  /** Whether select is disabled */
  disabled?: boolean;
}

/**
 * ValidatedSelect component
 * 
 * Select field with automatic validation error display.
 * Must be used within a FormProvider context.
 * 
 * @example
 * ```tsx
 * <Form {...form}>
 *   <ValidatedSelect
 *     name="status"
 *     label="Status"
 *     options={[
 *       { value: "active", label: "Active" },
 *       { value: "inactive", label: "Inactive" },
 *     ]}
 *     placeholder="Select a status"
 *     required
 *   />
 * </Form>
 * ```
 */
export function ValidatedSelect({
  name,
  label,
  options,
  placeholder,
  description,
  required,
  disabled,
}: ValidatedSelectProps) {
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
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
