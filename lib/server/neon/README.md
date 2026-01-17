# Neon Server Utilities

Server-side Neon database utilities for AXIS BoardRoom.

## Modules

### `data-api.ts`
Server-side Data API utilities for edge functions and API routes.

**Usage:**
```typescript
import { executeDataApiQuery, isDataApiConfigured } from '@/lib/server/neon/data-api'

if (isDataApiConfigured()) {
  const result = await executeDataApiQuery(
    'SELECT * FROM users',
    [],
    userToken // Optional RLS token
  )
}
```

### `project-management.ts`
Reference implementation for project-per-user multitenancy (future use).

**Note:** This is a reference implementation. Your current architecture uses shared schema with RLS. These utilities are ready for future migration to project-per-user when needed.

**Usage (when implemented):**
```typescript
import { createTenantProject, getTenantConnectionString } from '@/lib/server/neon/project-management'

// Create project for new tenant
const project = await createTenantProject(orgId, 'us-east-1')

// Get connection string for tenant
const connectionString = await getTenantConnectionString(orgId)
```

## Exports

All utilities are exported from `@/lib/server/neon`:

```typescript
import {
  // Data API
  executeDataApiQuery,
  getDataApiUrl,
  getDataApiKey,
  isDataApiConfigured,
  
  // Project Management (reference)
  createTenantProject,
  getTenantConnectionString,
  deleteTenantProject,
  isProjectPerUserEnabled,
  getTenantProjectId,
} from '@/lib/server/neon'
```

## Documentation

- [Data API Optimization Guide](../../../docs/NEON_DATA_API_OPTIMIZATION.md)
- [Multitenancy Architecture](../../../docs/NEON_MULTITENANCY_ARCHITECTURE.md)
- [Drizzle RLS Integration](../../../docs/DRIZZLE_RLS_INTEGRATION.md)
