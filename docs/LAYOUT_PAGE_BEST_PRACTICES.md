# Next.js Layout & Page Best Practices

## Current Structure Analysis ✅

Your project follows Next.js best practices well. Here are recommendations to enhance it further.

---

## 1. ✅ Root Layout (Already Good)

Your `app/layout.tsx` is correctly structured:

```tsx
// ✅ Correct: Contains <html> and <body>
// ✅ Correct: Accepts children prop
// ✅ Correct: Includes metadata
// ✅ Correct: Uses suppressHydrationWarning for theme
```

**Recommendation**: Consider adding more metadata for SEO:

```tsx
export const metadata: Metadata = {
  title: {
    default: "AXIS BoardRoom",
    template: "%s | AXIS BoardRoom"
  },
  description: "Production-safe UI governance system",
  keywords: ["Next.js", "AXIS", "Design System"],
  authors: [{ name: "AXIS Team" }],
  creator: "AXIS",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AXIS BoardRoom",
  },
};
```

---

## 2. 🎯 Nested Layouts for Route Groups

**Best Practice**: Create layouts for route groups to share UI patterns.

### Recommended Structure:

```
app/
├── layout.tsx              # Root layout
├── (prod)/
│   ├── layout.tsx         # Production layout (sidebar, header)
│   ├── page.tsx
│   ├── dashboard/
│   └── tasks/
├── (lab)/
│   ├── layout.tsx         # Lab layout (minimal, experimental)
│   └── playground/
└── (demo)/
    └── demo/
```

### Implementation:

**`app/(prod)/layout.tsx`** - Shared layout for production routes:

```tsx
import { AppSidebar } from "@/components/features/navigation/app-sidebar";
import { SiteHeader } from "@/components/features/navigation/site-header";
import { SidebarInset, SidebarProvider } from "@/components/primitives";

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
```

**Benefits:**
- ✅ Shared UI (sidebar, header) across production routes
- ✅ Consistent navigation
- ✅ Better code organization
- ✅ Easier maintenance

---

## 3. 📝 Use PageProps Helper Types

**Best Practice**: Use Next.js 16+ `PageProps` helper for better TypeScript inference.

### Current (Good):
```tsx
export default function Page() {
  return <h1>Hello</h1>
}
```

### Enhanced (Better):
```tsx
// For static pages
export default function Page(props: PageProps<'/'>) {
  return <h1>Hello</h1>
}

// For dynamic pages
export default async function TaskPage(
  props: PageProps<'/tasks/[id]'>
) {
  const { id } = await props.params;
  // TypeScript knows 'id' exists and is a string
  return <div>Task {id}</div>
}

// With search params
export default async function TasksPage(
  props: PageProps<'/tasks'>
) {
  const { status, priority } = await props.searchParams;
  // TypeScript knows these are string | string[] | undefined
  return <div>Tasks</div>
}
```

**Benefits:**
- ✅ Type-safe params and searchParams
- ✅ Better IDE autocomplete
- ✅ Compile-time error checking
- ✅ Self-documenting code

---

## 4. 🔄 Dynamic Routes Best Practices

### Current Structure:
You have static routes. Consider adding dynamic routes for:
- Task detail pages: `/tasks/[id]`
- Dashboard sections: `/dashboard/[section]`

### Implementation:

**`app/(prod)/tasks/[id]/page.tsx`**:

```tsx
import { notFound } from "next/navigation";
import { PageHeader, DetailPanel } from "@/components/axis";

// Generate static params for known tasks
export async function generateStaticParams() {
  // Fetch task IDs at build time
  const tasks = await getTasks();
  return tasks.map((task) => ({
    id: task.id,
  }));
}

export default async function TaskDetailPage(
  props: PageProps<'/tasks/[id]'>
) {
  const { id } = await props.params;
  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={task.title}
        subtitle={`Task ${task.id}`}
        actions={[
          { kind: "button", key: "edit", label: "Edit", onClick: () => {} },
        ]}
      />
      <DetailPanel data={task} />
    </>
  );
}
```

**Best Practices:**
- ✅ Use `generateStaticParams` for static generation
- ✅ Use `notFound()` for missing resources
- ✅ Type params with `PageProps`
- ✅ Handle loading states

---

## 5. 🔗 Navigation Best Practices

### Current Issue:
Your tasks page uses `href="#"` with `onClick` handlers. Use Next.js `<Link>` instead.

### Recommended:

**Before:**
```tsx
<PaginationLink
  href="#"
  onClick={(e) => { e.preventDefault(); setPage(p); }}
/>
```

**After:**
```tsx
import Link from "next/link";

// For client-side navigation
<Link href={`/tasks?page=${p}`} replace>
  {p}
</Link>

// Or use useRouter for programmatic navigation
import { useRouter } from "next/navigation";

const router = useRouter();
router.push(`/tasks?page=${p}`);
```

**Benefits:**
- ✅ Proper URL updates
- ✅ Browser history support
- ✅ Prefetching
- ✅ Better SEO
- ✅ Shareable URLs

---

## 6. 🎨 Component Organization

### Current (Good):
You're using AXIS components correctly:
```tsx
import { PageHeader, FilterBar } from "@/components/axis";
import { Button, Table } from "@/components/primitives";
```

### Best Practices:

1. **Import Order:**
```tsx
// 1. Next.js imports
import Link from "next/link";
import { notFound } from "next/navigation";

// 2. External libraries
import { useState } from "react";

// 3. Internal - AXIS components
import { PageHeader, FilterBar } from "@/components/axis";

// 4. Internal - Primitives
import { Button, Table } from "@/components/primitives";

// 5. Internal - Utilities
import { cn } from "@/lib/utils";
```

2. **Component Co-location:**
```
app/(prod)/tasks/
├── page.tsx
├── components/
│   ├── TaskTable.tsx      # Page-specific components
│   └── TaskFilters.tsx
└── actions.ts             # Server Actions
```

---

## 7. ⚡ Performance Best Practices

### 1. Server Components by Default

**Current**: Your tasks page is a client component (`"use client"`).

**Recommendation**: Split into Server + Client:

```tsx
// app/(prod)/tasks/page.tsx (Server Component)
import { getTasks } from "@/lib/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await getTasks(); // Server-side data fetching
  
  return <TasksClient initialTasks={tasks} />;
}
```

```tsx
// app/(prod)/tasks/tasks-client.tsx (Client Component)
"use client";

export function TasksClient({ initialTasks }) {
  // Client-side interactivity
  const [tasks, setTasks] = useState(initialTasks);
  // ...
}
```

### 2. Loading States

**Add loading.tsx files:**

```tsx
// app/(prod)/tasks/loading.tsx
import { Skeleton } from "@/components/primitives";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
```

### 3. Error Boundaries

**Add error.tsx files:**

```tsx
// app/(prod)/tasks/error.tsx
"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/axis";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      preset="error"
      title="Something went wrong"
      description={error.message}
      action={{
        label: "Try again",
        onClick: reset,
      }}
    />
  );
}
```

---

## 8. 🔍 SEO & Metadata Best Practices

### Per-Page Metadata:

```tsx
// app/(prod)/tasks/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks and track progress",
  openGraph: {
    title: "Tasks | AXIS BoardRoom",
    description: "Manage your tasks and track progress",
  },
};

export default function TasksPage() {
  // ...
}
```

### Dynamic Metadata:

```tsx
// app/(prod)/tasks/[id]/page.tsx
export async function generateMetadata(
  props: PageProps<'/tasks/[id]'>
): Promise<Metadata> {
  const { id } = await props.params;
  const task = await getTask(id);

  return {
    title: task.title,
    description: task.description,
  };
}
```

---

## 9. 🛡️ Type Safety Best Practices

### Use LayoutProps Helper:

```tsx
// app/(prod)/layout.tsx
export default function ProductionLayout(
  props: LayoutProps<'/(prod)'>
) {
  // TypeScript knows about children and any slots
  return (
    <div>
      {props.children}
      {/* If you add @analytics slot, it appears here */}
    </div>
  );
}
```

### Type-Safe Search Params:

```tsx
// app/(prod)/tasks/page.tsx
import { z } from "zod";

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  status: z.string().optional(),
  priority: z.array(z.string()).optional(),
});

export default async function TasksPage(
  props: PageProps<'/tasks'>
) {
  const rawParams = await props.searchParams;
  const params = searchParamsSchema.parse(rawParams);
  
  // Now params is type-safe!
  const { page, status, priority } = params;
}
```

---

## 10. 📱 Responsive Design Best Practices

### Current:
Your dashboard uses responsive classes correctly.

### Recommendation: Use Container Components

```tsx
// app/(prod)/layout.tsx
export default function ProductionLayout({ children }) {
  return (
    <div className="container mx-auto max-w-7xl">
      {children}
    </div>
  );
}
```

---

## 11. 🎯 Route Group Best Practices

### Current Structure (Excellent):
```
(prod)/  - Production routes (strict governance)
(lab)/   - Lab routes (unrestricted)
(demo)/  - Demo routes (teaching)
```

### Best Practices:
- ✅ Route groups don't affect URLs
- ✅ Each group can have its own layout
- ✅ Perfect for organizing by feature/team
- ✅ Maintains governance boundaries

---

## 12. 🔐 Security Best Practices

### 1. Server Actions for Mutations:

```tsx
// app/(prod)/tasks/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  // Server-side validation
  const title = formData.get("title");
  
  // Create task
  await db.tasks.create({ title });
  
  // Revalidate
  revalidatePath("/tasks");
}
```

### 2. Input Validation:

```tsx
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  status: z.enum(["todo", "in_progress", "done"]),
});

export async function createTask(data: unknown) {
  const validated = taskSchema.parse(data);
  // Now safe to use
}
```

---

## 📊 Summary: Priority Recommendations

### High Priority:
1. ✅ Add nested layouts for route groups
2. ✅ Use `PageProps` helper types
3. ✅ Replace `href="#"` with proper `<Link>` components
4. ✅ Add `loading.tsx` and `error.tsx` files

### Medium Priority:
5. ✅ Split Server/Client components
6. ✅ Add per-page metadata
7. ✅ Implement dynamic routes with `generateStaticParams`
8. ✅ Use Server Actions for mutations

### Low Priority:
9. ✅ Enhanced metadata in root layout
10. ✅ Type-safe search params with Zod
11. ✅ Container components for responsive design

---

## 🚀 Quick Wins

1. **Add loading states** (5 minutes):
   ```bash
   # Create loading.tsx in each route
   touch app/(prod)/tasks/loading.tsx
   ```

2. **Add error boundaries** (5 minutes):
   ```bash
   # Create error.tsx in each route
   touch app/(prod)/tasks/error.tsx
   ```

3. **Fix navigation** (10 minutes):
   - Replace `href="#"` with proper URLs
   - Use `useRouter` or `<Link>` components

4. **Add nested layout** (15 minutes):
   - Create `app/(prod)/layout.tsx`
   - Move shared UI (sidebar, header) there

---

**Last Updated**: 2026-01-17
**Next.js Version**: 16.1.3
**Status**: ✅ Current structure is good, enhancements recommended above
