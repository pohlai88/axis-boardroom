---
name: Hybrid Lib Reorganization
overview: "Reorganize lib folder using hybrid model: top-level boundaries (design/shared/server/client/core) with tech folders inside (zod, zustand, drizzle). This prevents tech zoo while maintaining clear runtime boundaries."
todos: []
---

# Hybrid Lib Reorganization Plan

## Architecture Overview

Reorganize `lib/` using the hybrid model:

- **Top-level = runtime boundaries** (design/shared/server/client/core)
- **Tech folders at top level within boundaries** (drizzle, zod, zustand)

This is the "cleanest individual folder" approach:
- ✅ **Zod stays Zod** - grouped by validation purpose
- ✅ **Zustand stays Zustand** - grouped by state management
- ✅ **Drizzle stays Drizzle** - grouped by ORM
- ✅ **Never mix server + client** - runtime boundaries prevent future refactor pain
- ✅ **Design isolation** - UI tokens never change, stay separate

**Key principle**: Tech folders are at the top level within each runtime boundary, not nested deeper. This gives you "zod is zod" while maintaining safety.

## Target Structure

```
lib/
├── design/                    # UI never change zone
│   ├── tokens.ts              # design-tokens.ts
│   ├── motion.ts              # motion-tokens.ts
│   ├── typography.tsx         # typography.tsx
│   └── ui-system.ts           # ui-system.ts
│
├── shared/                    # Universal contracts
│   ├── types/
│   │   └── axis-props.ts      # types/axis-props.ts
│   ├── patterns/
│   │   └── registry.ts        # patterns/registry.ts
│   ├── config/
│   │   └── navigation.ts      # config/navigation.ts
│   └── utils/
│       ├── dev-assert.ts      # utils/dev-assert.ts
│       └── safe-text.tsx      # utils/safe-text.tsx
│
├── server/                     # Server runtime only
│   ├── actions/
│   │   ├── index.ts           # actions/index.ts
│   │   └── tasks.ts            # actions/tasks.ts
│   ├── proxy/
│   │   ├── auth.ts            # proxy/auth.ts
│   │   └── security.ts        # proxy/security.ts
│   ├── drizzle/                # db/ → drizzle/ (tech folder at top level)
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── schema.sql
│   │   └── analytics.ts
│   ├── zod/                    # Server zod schemas (actions, DB writes)
│   │   └── (inline in actions for now, or create separate files)
│   ├── cache/
│   │   └── redis.ts           # cache/redis.ts
│   └── seed/                   # seed/ → server/seed/
│       ├── index.ts
│       ├── dashboard.json
│       ├── playground.json
│       └── tasks.json
│
├── client/                     # Client runtime only
│   ├── hooks/
│   │   └── use-analytics.ts   # hooks/use-analytics.ts
│   ├── zustand/                # stores/ → zustand/ (tech folder at top level)
│   │   └── analytics-store.ts  # stores/analytics-store.ts
│   ├── zod/                    # Client zod schemas (forms, domain validation)
│   │   └── domain.ts          # schemas/domain.ts (client-only)
│   └── providers/
│       └── query-provider.tsx  # providers/query-provider.tsx
│
└── core/                       # Pure foundations
    ├── env.ts                 # env.ts
    ├── logger.ts               # logger.ts
    └── utils.ts               # utils.ts (cn function)
```

## File Mapping

### Design (UI never change)

- `lib/design-tokens.ts` → `lib/design/tokens.ts`
- `lib/motion-tokens.ts` → `lib/design/motion.ts`
- `lib/typography.tsx` → `lib/design/typography.tsx`
- `lib/ui-system.ts` → `lib/design/ui-system.ts`

### Shared (Universal)

- `lib/types/axis-props.ts` → `lib/shared/types/axis-props.ts`
- `lib/patterns/registry.ts` → `lib/shared/patterns/registry.ts`
- `lib/config/navigation.ts` → `lib/shared/config/navigation.ts`
- `lib/utils/dev-assert.ts` → `lib/shared/utils/dev-assert.ts`
- `lib/utils/safe-text.tsx` → `lib/shared/utils/safe-text.tsx`

### Server (Server runtime)

- `lib/actions/*` → `lib/server/actions/*`
- `lib/proxy/*` → `lib/server/proxy/*`
- `lib/db/*` → `lib/server/drizzle/*` (tech folder at top level)
- `lib/cache/redis.ts` → `lib/server/cache/redis.ts`
- `lib/seed/*` → `lib/server/seed/*`
- Server zod schemas (from actions) → `lib/server/zod/*` (if extracted)

### Client (Client runtime)

- `lib/hooks/*` → `lib/client/hooks/*`
- `lib/stores/analytics-store.ts` → `lib/client/zustand/analytics-store.ts` (tech folder at top level)
- `lib/providers/*` → `lib/client/providers/*`
- `lib/schemas/domain.ts` → `lib/client/zod/domain.ts` (tech folder at top level)

### Core (Foundations)

- `lib/env.ts` → `lib/core/env.ts`
- `lib/logger.ts` → `lib/core/logger.ts`
- `lib/utils.ts` → `lib/core/utils.ts`

## Implementation Steps

### Step 1: Create Directory Structure

Create new directories:

- `lib/design/`
- `lib/shared/types/`, `lib/shared/patterns/`, `lib/shared/config/`, `lib/shared/utils/`
- `lib/server/actions/`, `lib/server/proxy/`, `lib/server/drizzle/`, `lib/server/zod/`, `lib/server/cache/`, `lib/server/seed/`
- `lib/client/hooks/`, `lib/client/zustand/`, `lib/client/zod/`, `lib/client/providers/`
- `lib/core/`

### Step 2: Move Files

Move files according to mapping above. Rename files where needed:

- `design-tokens.ts` → `tokens.ts`
- `motion-tokens.ts` → `motion.ts`

### Step 3: Create Index Files

Create barrel exports for each category:

- `lib/design/index.ts` - exports all design files
- `lib/shared/index.ts` - exports types, patterns, config, utils
- `lib/server/index.ts` - exports actions, proxy, db, cache, seed
- `lib/client/index.ts` - exports hooks, state, providers, schemas
- `lib/core/index.ts` - exports env, logger, utils

### Step 4: Update Internal Cross-References

Update imports within lib files:

- `lib/server/drizzle/index.ts`: `@/lib/env` → `@/lib/core/env`
- `lib/server/cache/redis.ts`: `@/lib/env` → `@/lib/core/env`
- `lib/server/actions/tasks.ts`: `@/lib/seed` → `@/lib/server/seed`
- Any other internal lib imports

### Step 5: Update TypeScript Path Aliases

Update `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/lib/*": ["./lib/*"],
    "@/lib/design/*": ["./lib/design/*"],
    "@/lib/shared/*": ["./lib/shared/*"],
    "@/lib/server/*": ["./lib/server/*"],
    "@/lib/client/*": ["./lib/client/*"],
    "@/lib/core/*": ["./lib/core/*"]
  }
}
```

### Step 6: Update External Imports

Update all imports outside lib (140+ files):

- `@/lib/env` → `@/lib/core/env`
- `@/lib/logger` → `@/lib/core/logger`
- `@/lib/utils` → `@/lib/core/utils`
- `@/lib/design-tokens` → `@/lib/design/tokens`
- `@/lib/motion-tokens` → `@/lib/design/motion`
- `@/lib/typography` → `@/lib/design/typography`
- `@/lib/ui-system` → `@/lib/design/ui-system`
- `@/lib/db/*` → `@/lib/server/drizzle/*`
- `@/lib/cache/*` → `@/lib/server/cache/*`
- `@/lib/actions/*` → `@/lib/server/actions/*`
- `@/lib/proxy/*` → `@/lib/server/proxy/*`
- `@/lib/seed/*` → `@/lib/server/seed/*`
- `@/lib/hooks/*` → `@/lib/client/hooks/*`
- `@/lib/stores/*` → `@/lib/client/zustand/*`
- `@/lib/providers/*` → `@/lib/client/providers/*`
- `@/lib/schemas/*` → `@/lib/client/zod/*`
- `@/lib/types/*` → `@/lib/shared/types/*`
- `@/lib/patterns/*` → `@/lib/shared/patterns/*`
- `@/lib/config/*` → `@/lib/shared/config/*`
- `@/lib/utils/dev-assert` → `@/lib/shared/utils/dev-assert`
- `@/lib/utils/safe-text` → `@/lib/shared/utils/safe-text`

### Step 7: Verification

- Run `npm run typecheck` - all paths should resolve
- Run `npm run build` - should succeed
- Start dev server - should work without errors
- Check for circular dependencies

## Key Decisions

1. **schemas/domain.ts → client/zod/**: Used only by client components (approval-panel, badges), not server actions. Server actions have inline zod schemas. Zod is a tech folder at top level within client boundary.

4. **Server zod schemas**: Currently inline in actions. Can extract to `server/zod/` if they grow or need reuse.

2. **db/ → server/drizzle/**: Tech folder at top level within server boundary. Drizzle is the ORM technology, making it easy to swap later (e.g., add `server/prisma/` if needed).

3. **stores/ → client/zustand/**: Tech folder at top level within client boundary. Zustand is the state management tech, clearly client-only.

5. **utils.ts stays in core**: The `cn` utility is pure and used everywhere, so it stays in core.

6. **shared/utils/**: Contains domain-specific utilities (dev-assert, safe-text) that are shared but not core foundations.

7. **Logger in core/**: Pino structured logging belongs in `core/logger.ts` - one canonical logger for the entire app (prevents console.log chaos).

## Benefits

- **Clear boundaries**: Server code can't accidentally import client code
- **Tech grouping**: Zod, Zustand, Drizzle grouped where appropriate
- **Future-proof**: Easy to add new tech (e.g., `server/db/prisma/` if needed)
- **No tech zoo**: One feature doesn't span 6 folders
- **Design isolation**: UI tokens never mixed with business logic

## Files to Modify

- All files in `lib/` (move/rename)
- `tsconfig.json` (path aliases)
- ~140 files importing from `@/lib/*` (update imports)
- Create 5 new index.ts files for barrel exports