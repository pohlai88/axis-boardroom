# Zod UI/UX Enforcement Strategy

## Current State Audit ✅

### Forms Using Zod + zodResolver (1/4) - 25%
| Component | File | Status | Schema | Resolver |
|-----------|------|--------|--------|----------|
| TaskFormDialog | `app/(prod)/tasks/task-form-dialog.tsx` | ✅ **GOOD** | `taskFormSchema` | ✅ `zodResolver` |
| NeonSignupForm | `components/features/auth/neon-signup-form.tsx` | ❌ **NO ZOD** | None | Manual useState |
| NeonLoginForm | `components/features/auth/neon-login-form.tsx` | ❌ **NO ZOD** | None | Manual useState |
| MagicLinkForm | `components/features/auth/magic-link-form.tsx` | ❌ **NO ZOD** | None | Manual useState |
| Showcase Forms | `app/(showcase)/showcase/forms/page.tsx` | ❌ **NO ZOD** | None | Demo only |

### Component Props Validation (0/15) - 0%
| Component | Props Validated | devAssert Used |
|-----------|-----------------|----------------|
| ApprovalPanel | ✅ Yes | ✅ Yes |
| AuditTimeline | ✅ Yes | ✅ Yes |
| All other composites | ❌ No | ❌ No |
| Auth components | ❌ No | ❌ No |
| Feature components | ❌ No | ❌ No |

### API Response Validation (0/∞) - 0%
- ❌ No runtime validation of API responses in client code
- ❌ TanStack Query hooks don't validate response shapes
- ❌ `fetch()` calls don't validate returned data

---

## Enforcement Plan

### 🎯 Phase 1: Auth Forms (High Priority)
**Goal:** Convert all auth forms to React Hook Form + zodResolver

#### 1.1 Create Auth Form Schemas
```typescript
// lib/contracts/forms/auth.form.contract.ts
import { z } from "zod"

export const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
})

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const magicLinkFormSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type SignupFormData = z.infer<typeof signupFormSchema>
export type LoginFormData = z.infer<typeof loginFormSchema>
export type MagicLinkFormData = z.infer<typeof magicLinkFormSchema>
```

#### 1.2 Refactor NeonSignupForm
**Before:**
```typescript
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Manual validation, no type safety
}
```

**After:**
```typescript
const form = useForm<SignupFormData>({
  resolver: zodResolver(signupFormSchema),
  defaultValues: { name: "", email: "", password: "" },
});

const onSubmit = async (data: SignupFormData) => {
  // Type-safe, validated data
  const { error } = await authClient.signUp.email(data);
  // ... handle response
}
```

#### 1.3 Benefits
- ✅ Type-safe form data
- ✅ Client-side validation with error messages
- ✅ Consistent validation rules
- ✅ Better UX with field-level errors
- ✅ No manual `useState` management

---

### 🎯 Phase 2: Component Props Validation (Medium Priority)
**Goal:** Validate all composite component props in development

#### 2.1 Strategy
Use `devAssert` pattern (already established in ApprovalPanel and AuditTimeline):

```typescript
// components/_internal/composites/filter-bar.tsx
import { devAssert } from "@/lib/shared/utils/dev-assert";
import { z } from "zod";

const FilterBarPropsSchema = z.object({
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["select", "text", "date"]),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
  })),
  onFilterChange: z.function(),
});

export function FilterBar(props: FilterBarProps) {
  // Validate in dev, zero cost in production
  devAssert(FilterBarPropsSchema, props, "FilterBarProps");
  
  // ... component logic
}
```

#### 2.2 Components to Add Validation
1. ✅ ApprovalPanel (already done)
2. ✅ AuditTimeline (already done)
3. ❌ ConfirmDialog
4. ❌ DataTableShell
5. ❌ DetailPanel
6. ❌ EmptyState
7. ❌ FilterBar
8. ❌ FormShell
9. ❌ PageHeader
10. ❌ StatCard

---

### 🎯 Phase 3: API Response Validation (High Priority)
**Goal:** Validate all API responses at runtime

#### 3.1 Create API Response Validator Hook
```typescript
// lib/client/hooks/use-validated-query.ts
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

export function useValidatedQuery<TData, TSchema extends z.ZodType<TData>>(
  options: UseQueryOptions<unknown, Error, TData> & {
    schema: TSchema;
  }
) {
  return useQuery({
    ...options,
    select: (data) => {
      const result = options.schema.safeParse(data);
      if (!result.success) {
        console.error("[API Validation Error]", result.error.flatten());
        throw new Error("Invalid API response shape");
      }
      return result.data;
    },
  });
}
```

#### 3.2 Usage Example
```typescript
// Before: No validation
const { data } = useQuery({
  queryKey: ["tasks"],
  queryFn: async () => {
    const res = await fetch("/api/tasks");
    return res.json(); // Unvalidated!
  },
});

// After: Runtime validation
const { data } = useValidatedQuery({
  queryKey: ["tasks"],
  queryFn: async () => {
    const res = await fetch("/api/tasks");
    return res.json();
  },
  schema: z.array(taskApiSchema), // Validates at runtime!
});
```

#### 3.3 Validated Fetch Wrapper
```typescript
// lib/client/api/validated-fetch.ts
import { z } from "zod";

export async function validatedFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, init);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.error("[API Validation Error]", {
      url,
      errors: result.error.flatten(),
      receivedData: data,
    });
    throw new Error("Invalid API response shape");
  }
  
  return result.data;
}

// Usage
const tasks = await validatedFetch(
  "/api/tasks",
  z.array(taskApiSchema)
);
```

---

### 🎯 Phase 4: Form Field Components (Low Priority)
**Goal:** Create reusable validated form field components

#### 4.1 Validated Input Component
```typescript
// components/_internal/ui/validated-input.tsx
import { useFormContext } from "react-hook-form";
import { Input, type InputProps } from "./input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./form";

interface ValidatedInputProps extends Omit<InputProps, "name"> {
  name: string;
  label: string;
  description?: string;
}

export function ValidatedInput({ name, label, description, ...props }: ValidatedInputProps) {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

---

## Implementation Checklist

### Phase 1: Auth Forms ✅ DO FIRST
- [ ] Create `lib/contracts/forms/auth.form.contract.ts`
- [ ] Refactor `NeonSignupForm` to use React Hook Form + zodResolver
- [ ] Refactor `NeonLoginForm` to use React Hook Form + zodResolver
- [ ] Refactor `MagicLinkForm` to use React Hook Form + zodResolver
- [ ] Add error message mapping for auth errors
- [ ] Test all auth flows

### Phase 2: Component Props
- [ ] Add Zod schemas for all composite component props
- [ ] Apply `devAssert` pattern to all composites
- [ ] Document prop validation pattern
- [ ] Add examples to component docs

### Phase 3: API Response Validation
- [ ] Create `use-validated-query.ts` hook
- [ ] Create `validated-fetch.ts` utility
- [ ] Migrate all `useQuery` calls to use validation
- [ ] Migrate all `fetch` calls to use validation
- [ ] Add error telemetry for validation failures

### Phase 4: Form Components
- [ ] Create `ValidatedInput` component
- [ ] Create `ValidatedTextarea` component
- [ ] Create `ValidatedSelect` component
- [ ] Create `ValidatedCheckbox` component
- [ ] Update form examples to use validated components

---

## Patterns & Best Practices

### ✅ DO: Use zodResolver for all forms
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { /* ... */ },
});
```

### ✅ DO: Use devAssert for component props (dev-only)
```typescript
export function MyComponent(props: MyProps) {
  devAssert(MyPropsSchema, props, "MyComponentProps");
  // ...
}
```

### ✅ DO: Validate API responses at runtime
```typescript
const data = await validatedFetch("/api/endpoint", responseSchema);
```

### ❌ DON'T: Use manual useState for form fields
```typescript
// Bad
const [email, setEmail] = useState("");
const [error, setError] = useState("");
```

### ❌ DON'T: Trust API responses without validation
```typescript
// Bad
const data = await fetch("/api/endpoint").then(r => r.json());
// data might not match expected shape!
```

### ❌ DON'T: Skip validation in production
```typescript
// Bad
if (process.env.NODE_ENV === "development") {
  validateData(data);
}
```

**Exception:** `devAssert` is specifically designed for zero-cost prop validation

---

## Benefits Summary

### Developer Experience
- ✅ Type safety from schema to UI
- ✅ Autocomplete for form data
- ✅ Early error detection
- ✅ Consistent validation logic

### User Experience
- ✅ Better error messages
- ✅ Field-level validation feedback
- ✅ Prevented invalid submissions
- ✅ Consistent form behavior

### Maintenance
- ✅ Single source of truth (Zod schemas)
- ✅ Easy to update validation rules
- ✅ Self-documenting code
- ✅ Reduced bugs from type mismatches

---

## Next Steps

1. **START HERE:** Phase 1 - Auth Forms (highest impact, user-facing)
2. Then: Phase 3 - API Response Validation (prevents runtime errors)
3. Then: Phase 2 - Component Props (improves DX)
4. Finally: Phase 4 - Form Components (nice-to-have)

**Priority Order:** Auth Forms → API Validation → Props Validation → Form Components
