# Navigation Best Practices

## Current Issues Found

1. ❌ Sidebar navigation uses `href="#"` instead of Next.js `<Link>`
2. ❌ Breadcrumbs use `href="#"` 
3. ❌ ActionSpec "link" type uses `<a>` instead of Next.js `<Link>`
4. ✅ Tasks pagination already uses proper URLs (good!)

---

## Implementation Plan

### 1. Update Navigation Components

**Priority: High**

- Update `nav-main.tsx` to use Next.js `<Link>`
- Update `nav-projects.tsx` to use Next.js `<Link>`
- Update `nav-secondary.tsx` to use Next.js `<Link>`
- Update `site-header.tsx` breadcrumbs to use Next.js `<Link>`
- Update `app-sidebar.tsx` to use proper routes

### 2. Fix ActionSpec Link Type

**Priority: High**

- Update `action-spec.tsx` to use Next.js `<Link>` for internal links
- Keep `<a>` for external links
- Add proper prefetching support

### 3. Update Route Data

**Priority: Medium**

- Replace `url: "#"` with actual routes:
  - `/dashboard` for Dashboard
  - `/tasks` for Tasks
  - `/login` for Login
  - etc.

### 4. Add Navigation Utilities

**Priority: Low**

- Create `useNavigation` hook for common patterns
- Add loading indicators for slow networks
- Implement hover prefetching for large lists

---

## Next.js Navigation Best Practices

### ✅ Always Use `<Link>` for Internal Navigation

```tsx
import Link from 'next/link'

// ✅ Good
<Link href="/dashboard">Dashboard</Link>

// ❌ Bad
<a href="/dashboard">Dashboard</a>
```

### ✅ Prefetching is Automatic

- Links are prefetched when they enter viewport
- Static routes: Full prefetch
- Dynamic routes: Partial prefetch (if `loading.tsx` exists)

### ✅ Disable Prefetching When Needed

```tsx
// For large lists or infinite scroll
<Link href="/blog" prefetch={false}>
  Blog
</Link>
```

### ✅ Use `useRouter` for Programmatic Navigation

```tsx
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/dashboard')
router.replace('/login') // No history entry
```

### ✅ URL State Management

```tsx
import { useRouter, useSearchParams } from 'next/navigation'

const router = useRouter()
const searchParams = useSearchParams()

// Update URL without navigation
const params = new URLSearchParams(searchParams.toString())
params.set('page', '2')
router.replace(`/tasks?${params.toString()}`, { scroll: false })
```

### ✅ Native History API

```tsx
// For sort/filter without navigation
window.history.pushState(null, '', `?sort=${sortOrder}`)

// For locale switching (replace current)
window.history.replaceState(null, '', `/${locale}${pathname}`)
```

---

## Benefits of Proper Navigation

1. **Prefetching**: Routes load faster
2. **Client-side transitions**: No full page reloads
3. **Better UX**: Instant navigation feel
4. **SEO**: Proper URLs and history
5. **Shareable URLs**: Users can share specific states

---

**Status**: Ready for implementation
**Priority**: High - Navigation is critical for UX
