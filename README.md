# AXIS BoardRoom

Production-safe UI governance system built with Next.js 16 and the AXIS design system.

---

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# Build and run with Docker
docker-compose up -d

# Or build manually
docker build -t axis-boardroom .
docker run -p 3000:3000 axis-boardroom
```

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Project Structure

```
AXIS-BoardRoom/
├── app/
│   ├── (prod)/          # Production routes (strict governance)
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   └── login/
│   ├── (lab)/           # Lab routes (unrestricted)
│   │   ├── playground/
│   │   └── examples/
│   ├── (demo)/          # Demo routes (teaching)
│   │   └── demo/
│   ├── layout.tsx
│   ├── ClientLayout.tsx
│   └── globals.css
├── components/
│   ├── axis/            # Public API - use this in production routes
│   ├── primitives/      # Safe re-exports of UI components
│   ├── features/        # App-level widgets (auth, calendars, charts, navigation, tables, theme)
│   └── _internal/       # Protected implementation
│       ├── composites/  # High-level UI blocks
│       ├── micro/       # Domain-specific badges
│       └── ui/          # Base shadcn components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configuration
│   ├── design-tokens.ts
│   ├── motion-tokens.ts
│   ├── utils.ts
│   ├── schemas/
│   ├── types/
│   └── patterns/
└── components.json      # shadcn/ui configuration
```

---

## Route Zones

Routes are organized into governance zones:

| Zone | Path | Policy |
|------|------|--------|
| `(prod)` | `/`, `/dashboard`, `/tasks`, `/login` | Strict: cannot import `_internal/*` |
| `(lab)` | `/playground`, `/examples` | Allowed: can import anything |
| `(demo)` | `/demo` | Teaching: should use `axis` exports |

---

## How to Import Components

### For Production Routes

```tsx
// ✅ Correct - use AXIS composites
import { PageHeader, StatusBadge, FilterBar } from "@/components/axis";

// ✅ Correct - use primitives when needed
import { Button, Card } from "@/components/primitives";

// ❌ Forbidden in (prod) - will error
import { Button } from "@/components/_internal/ui/button";
```

### For Lab Routes

```tsx
// ✅ Allowed - experiment freely
import { Button } from "@/components/_internal/ui/button";
import { PageHeader } from "@/components/_internal/composites";
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # Run TypeScript type checking
```

---

## AXIS Components

### Composites (Workflow Building Blocks)

- `PageHeader` - Universal page top with title + actions
- `FilterBar` - Search + filters + actions row
- `DataTableShell` - Table wrapper with loading/empty states
- `ApprovalPanel` - Approval workflow with actions
- `AuditTimeline` - Chronological event display
- `FormShell` - Form with loading states
- `DetailPanel` - Read-only detail view
- `StatCard` - Metric card
- `EmptyState` - Empty/no-data state
- `ConfirmDialog` - Confirmation modal

### Micro-Composites (Domain Semantics)

- `StatusBadge` - Renders approval status
- `PriorityBadge` - Renders priority level
- `RoleBadge` - Renders user role

### ActionSpec System

```tsx
<PageHeader
  title="Dashboard"
  actions={[
    { kind: "button", key: "new", label: "New", onClick: handleNew },
    { kind: "button", key: "export", label: "Export", variant: "outline" },
  ]}
/>
```

---

## Governance Rules

AXIS enforces UI governance through:

1. **AxisProps<T>** - Prevents `className` and `style` injection at type level
2. **ActionSpec Slots** - Prevents ReactNode injection in action slots
3. **Zod Contract Gates** - Runtime prop validation (dev only)
4. **SafeText** - XSS protection for user-provided content
5. **ESLint Boundaries** - Zone-based import restrictions

---

## Design Tokens

Complete theme system with CSS variables for:

- Core colors (background, foreground, primary, secondary, etc.)
- Status colors (pending, approved, rejected, draft, cancelled)
- Priority colors (critical, high, medium, low)
- Surface system (surface-0 through surface-3)
- Chart colors (chart-1 through chart-5)
- Sidebar colors
- Animation variables

All tokens support light and dark modes using oklch color space.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## Status: Production Ready ✅

**Migration Completed**: 2026-01-17

### Governance State

- ✅ Structure sealed - `axis/primitives/features/_internal` hierarchy
- ✅ Boundaries enforced - ESLint zone rules
- ✅ Dependencies installed - All packages ready
- ✅ Routes organized - (prod), (lab), (demo) zones
- ✅ Design tokens - Complete theme system

### Next Steps

1. Start the dev server: `npm run dev`
2. Explore the examples in `/playground` and `/examples`
3. Build your features in the appropriate zone
4. Use AXIS composites in production routes
