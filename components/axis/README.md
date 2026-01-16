# AXIS Public API Contract

This is the **only** import surface for production pages.

## Stable Exports

### Composites (workflow building blocks)

| Export | Purpose | Stability |
|--------|---------|-----------|
| `PageHeader` | Page top with title + actions | ✅ Stable |
| `FilterBar` | Search + filters + actions | ✅ Stable |
| `DataTableShell` | Table wrapper with states | ✅ Stable |
| `ApprovalPanel` | Approval workflow | ✅ Stable |
| `AuditTimeline` | Event timeline | ✅ Stable |
| `FormShell` | Form with loading states | ✅ Stable |
| `DetailPanel` | Read-only detail view | ✅ Stable |
| `StatCard` | Metric card | ✅ Stable |
| `EmptyState` | Empty/no-data state | ✅ Stable |
| `ConfirmDialog` | Confirmation modal | ✅ Stable |

### Micro-composites (domain semantics)

| Export | Purpose | Stability |
|--------|---------|-----------|
| `StatusBadge` | Approval status | ✅ Stable |
| `PriorityBadge` | Priority level | ✅ Stable |
| `RoleBadge` | User role | ✅ Stable |

### ActionSpec (action rendering)

| Export | Purpose |
|--------|---------|
| `ActionSpec` | Type for action definitions |
| `renderActionSpec` | Render single action |
| `renderActionSpecs` | Render action array |

### Utilities

| Export | Purpose |
|--------|---------|
| `motion`, `enter`, `exit` | Animation tokens |
| `AxisProps<T>` | Type that forbids className/style |

## How to Import

```tsx
// ✅ Correct - pages import from axis
import { PageHeader, StatusBadge } from "@/components/axis";

// ✅ Correct - when you need primitives
import { Button, Card } from "@/components/primitives";

// ❌ Forbidden in (prod) - will error
import { Button } from "@/components/_internal/ui/button";
```

## Forbidden

- **Never import from `_internal/*` in production routes**
- **Never add `className` or `style` props to AXIS components**
- **Never pass `ReactNode` to action slots - use `ActionSpec[]`**

## Where to Prototype

Use `app/(lab)/*` for experiments:
- No import restrictions
- Can use `_internal/*` directly
- Test before promoting to axis

## Promoting to Stable

1. Build in `(lab)` or `features/*`
2. Add to `_internal/composites/` with proper types
3. Export through `axis/index.ts`
4. Document in this file
