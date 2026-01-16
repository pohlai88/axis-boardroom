# Server and Client Components Best Practices

@doc-version: 16.1.3  
@last-updated: 2025-12-19

## Overview

In Next.js 16+, layouts and pages are **Server Components by default**, which enables:
- Server-side data fetching
- Reduced JavaScript bundle size
- Better performance (FCP, streaming)
- Secure API key usage

This document outlines when and how to use Server vs Client Components in the AXIS BoardRoom project.

---

## Current Status

### ✅ Correctly Implemented

1. **Root Layout** (`app/layout.tsx`)
   - ✅ Server Component (default)
   - ✅ Wraps `ClientLayout` for theme management

2. **ClientLayout** (`app/ClientLayout.tsx`)
   - ✅ Client Component (`"use client"`)
   - ✅ Uses `localStorage` and `window` APIs
   - ✅ Handles theme initialization

3. **Error Boundaries** (`error.tsx` files)
   - ✅ Client Components (required by React)
   - ✅ Use `useEffect` for error logging

4. **UI Components**
   - ✅ Interactive components correctly marked with `"use client"`
   - ✅ Form components, dialogs, dropdowns properly scoped

### ⚠️ Areas for Improvement

1. **Tasks Page** (`app/(prod)/tasks/page.tsx`)
   - ⚠️ Entirely Client Component
   - 💡 **Recommendation**: Split into Server + Client pattern

2. **Login Form** (`components/features/auth/login-form.tsx`)
   - ⚠️ No `"use client"` directive
   - 💡 **Recommendation**: Add if form handlers are needed

---

## Decision Tree: Server vs Client?

### Use **Client Components** when you need:

- ✅ **State management**: `useState`, `useReducer`
- ✅ **Event handlers**: `onClick`, `onChange`, `onSubmit`
- ✅ **Lifecycle hooks**: `useEffect`, `useLayoutEffect`
- ✅ **Browser APIs**: `localStorage`, `window`, `document`, `navigator`
- ✅ **Custom hooks**: Any hook that uses client-only features
- ✅ **Context providers**: React Context (must be Client Component)
- ✅ **Third-party libraries**: Components that use client-only features

### Use **Server Components** when you need:

- ✅ **Data fetching**: Database queries, API calls
- ✅ **Secrets**: API keys, tokens (never exposed to client)
- ✅ **Large dependencies**: Reduce bundle size
- ✅ **Static content**: No interactivity needed
- ✅ **SEO**: Better initial HTML rendering

---

## Patterns and Examples

### 1. ✅ Server Component with Client Component Child

**Pattern**: Server Component fetches data, passes to Client Component for interactivity.

```tsx
// app/(prod)/tasks/page.tsx (Server Component)
import { getTasks } from "@/lib/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await getTasks(); // Server-side fetch
  
  return <TasksClient initialTasks={tasks} />;
}
```

```tsx
// app/(prod)/tasks/tasks-client.tsx (Client Component)
"use client";

import { useState } from "react";
import { PageHeader, FilterBar } from "@/components/axis";

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  
  // Client-side filtering, sorting, pagination
  // ...
}
```

**Benefits:**
- Data fetched on server (faster, secure)
- Smaller client bundle
- Better SEO and FCP

---

### 2. ✅ Context Provider Pattern

**Pattern**: Create Client Component wrapper for Context providers.

```tsx
// app/theme-provider.tsx (Client Component)
"use client";

import { createContext, useContext } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

```tsx
// app/layout.tsx (Server Component)
import { ThemeProvider } from "./theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- ✅ Providers should be as deep as possible in the tree
- ✅ Only wrap what needs context, not entire `<html>`
- ✅ Makes static parts easier to optimize

---

### 3. ✅ Server Component as Children Prop

**Pattern**: Pass Server Components as `children` to Client Components.

```tsx
// components/ui/modal.tsx (Client Component)
"use client";

import { useState } from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      {children}
    </div>
  );
}
```

```tsx
// app/(prod)/dashboard/page.tsx (Server Component)
import { Modal } from "@/components/ui/modal";
import { Cart } from "@/components/ui/cart"; // Server Component

export default function DashboardPage() {
  return (
    <Modal>
      <Cart /> {/* Server Component rendered on server */}
    </Modal>
  );
}
```

**Benefits:**
- Server Components render on server first
- Client Component only handles interactivity
- Better performance and SEO

---

### 4. ✅ Third-Party Component Wrapper

**Pattern**: Wrap third-party components that lack `"use client"`.

```tsx
// components/ui/carousel.tsx (Client Component)
"use client";

import { Carousel } from "acme-carousel";

// Re-export as Client Component
export default Carousel;
```

```tsx
// app/page.tsx (Server Component)
import Carousel from "@/components/ui/carousel";

export default function Page() {
  return (
    <div>
      <Carousel /> {/* Works in Server Component */}
    </div>
  );
}
```

**Why?**
- Third-party libraries may not have `"use client"`
- Wrapper ensures it works in Server Components
- Library authors should add `"use client"` to entry points

---

### 5. ✅ Preventing Environment Poisoning

**Pattern**: Use `server-only` and `client-only` packages to prevent accidental misuse.

```tsx
// lib/data.ts (Server-only)
import "server-only";

export async function getData() {
  const res = await fetch("https://api.example.com/data", {
    headers: {
      authorization: process.env.API_KEY, // Never exposed to client
    },
  });
  
  return res.json();
}
```

```tsx
// lib/client-utils.ts (Client-only)
import "client-only";

export function getLocalStorage(key: string) {
  return localStorage.getItem(key); // Only works in browser
}
```

**Installation:**
```bash
npm install server-only client-only
```

**Benefits:**
- Build-time errors if used incorrectly
- Clearer error messages
- Prevents security issues

---

## Recommended Refactoring: Tasks Page

### Current Implementation

```tsx
// app/(prod)/tasks/page.tsx
"use client"; // ❌ Entire page is Client Component

export default function TasksPage() {
  // All logic in Client Component
  const [tasks, setTasks] = useState(tasks);
  // ...
}
```

### Recommended Split

```tsx
// app/(prod)/tasks/page.tsx (Server Component)
import { getTasks } from "@/lib/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await getTasks(); // Server-side fetch
  
  return <TasksClient initialTasks={tasks} />;
}
```

```tsx
// app/(prod)/tasks/tasks-client.tsx (Client Component)
"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader, FilterBar, EmptyState } from "@/components/axis";
import { Table, Pagination } from "@/components/primitives";

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Client-side state and interactivity
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("");
  // ... rest of client logic
}
```

**Benefits:**
- ✅ Data fetched on server (faster, secure)
- ✅ Smaller JavaScript bundle
- ✅ Better SEO and initial load
- ✅ Client handles only interactivity

---

## Common Mistakes to Avoid

### ❌ Don't: Import Server-only Code in Client Components

```tsx
// ❌ Bad
"use client";

import { getData } from "@/lib/data"; // Uses process.env.API_KEY

export function ClientComponent() {
  // This will fail or expose secrets!
}
```

### ✅ Do: Pass Data as Props

```tsx
// ✅ Good
// app/page.tsx (Server Component)
import { getData } from "@/lib/data";
import { ClientComponent } from "./client-component";

export default async function Page() {
  const data = await getData();
  return <ClientComponent data={data} />;
}
```

---

### ❌ Don't: Use Hooks in Server Components

```tsx
// ❌ Bad
export default function ServerComponent() {
  const [state, setState] = useState(0); // Error!
  useEffect(() => {}, []); // Error!
}
```

### ✅ Do: Split into Server + Client

```tsx
// ✅ Good
// Server Component
export default function Page() {
  return <ClientComponent />;
}

// Client Component
"use client";
export function ClientComponent() {
  const [state, setState] = useState(0);
}
```

---

### ❌ Don't: Use Browser APIs in Server Components

```tsx
// ❌ Bad
export default function ServerComponent() {
  const theme = localStorage.getItem("theme"); // Error!
  const width = window.innerWidth; // Error!
}
```

### ✅ Do: Use Client Component for Browser APIs

```tsx
// ✅ Good
"use client";
export function ThemeComponent() {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem("theme") || "light"
  );
}
```

---

## Performance Optimization Tips

### 1. Minimize Client Component Boundaries

**Bad:**
```tsx
// app/layout.tsx
"use client"; // ❌ Entire layout is Client Component

export default function Layout({ children }) {
  return <div>{children}</div>;
}
```

**Good:**
```tsx
// app/layout.tsx (Server Component)
import { ThemeProvider } from "./theme-provider";

export default function Layout({ children }) {
  return (
    <div>
      <ThemeProvider>{children}</ThemeProvider>
    </div>
  );
}
```

### 2. Keep Client Components Small

- Extract only interactive parts
- Keep static content in Server Components
- Use composition patterns

### 3. Use Server Actions for Mutations

```tsx
// app/actions.ts (Server Actions)
"use server";

export async function createTask(data: FormData) {
  // Server-side mutation
  await db.tasks.create(data);
}
```

```tsx
// app/(prod)/tasks/tasks-client.tsx
"use client";

import { createTask } from "@/app/actions";

export function TasksClient() {
  async function handleSubmit(formData: FormData) {
    await createTask(formData); // Server Action
  }
}
```

---

## Checklist for New Components

When creating a new component, ask:

1. ✅ Does it need state or event handlers? → Client Component
2. ✅ Does it use browser APIs? → Client Component
3. ✅ Does it fetch data from database/API? → Server Component
4. ✅ Does it use secrets/API keys? → Server Component
5. ✅ Is it mostly static? → Server Component
6. ✅ Does it need React Context? → Client Component (provider)

---

## Testing Server vs Client Components

### Server Components
- Test data fetching logic
- Test server-side rendering
- Test error handling

### Client Components
- Test interactivity
- Test browser APIs
- Test state management
- Test event handlers

---

## Next Steps

1. **Refactor Tasks Page**: Split into Server + Client pattern
2. **Review Login Form**: Add `"use client"` if handlers are needed
3. **Audit Components**: Ensure proper Server/Client boundaries
4. **Add Server Actions**: Use for mutations instead of API routes
5. **Install Packages**: Add `server-only` and `client-only` for safety

---

## References

- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/react-essentials)
- [React: Server Components](https://react.dev/reference/rsc/server-components)
- [React: Client Components](https://react.dev/reference/rsc/use-client)

---

**Status**: Ready for implementation  
**Priority**: High - Performance and security critical
