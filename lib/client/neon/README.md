# Neon Client Utilities

Client-side Neon database utilities for browser and edge environments.

## Modules

### `data-api.ts`
Type-safe Data API client for browser and edge runtimes.

**Features:**
- ✅ Browser compatible
- ✅ Edge runtime compatible (Vercel Edge, Cloudflare Workers)
- ✅ RLS support with JWT tokens
- ✅ Zod validation helpers
- ✅ PostgREST compatible

**Usage:**
```typescript
import { neonDataApi } from '@/lib/client/neon/data-api'

// Create client
const client = neonDataApi()

// Simple query
const result = await client.query('SELECT * FROM users LIMIT 10')

// With parameters and RLS
const todos = await client.query({
  query: 'SELECT * FROM todos WHERE user_id = $1',
  params: [userId],
  token: userToken, // JWT token for RLS
})

// With Zod validation
const users = await client.queryWithSchema(
  'SELECT * FROM users',
  userSchema
)

// Single row
const user = await client.queryOne('SELECT * FROM users WHERE id = $1', [id])
```

## Default Instance

For convenience, a default instance is exported:

```typescript
import { dataApi } from '@/lib/client/neon/data-api'

// Use directly
const result = await dataApi.query('SELECT * FROM users')
```

## RLS Support

The Data API automatically respects PostgreSQL RLS policies when you pass a JWT token:

```typescript
import { useUser } from '@stackframe/stack'

function MyComponent() {
  const user = useUser()
  
  const fetchData = async () => {
    if (!user) return []
    
    const client = neonDataApi()
    const result = await client.query({
      query: 'SELECT * FROM tasks WHERE user_id = $1',
      params: [user.id],
      token: await user.getAccessToken(), // Required for RLS
    })
    
    return result.data
  }
}
```

## Error Handling

The client throws `DataApiError` for API errors:

```typescript
import { neonDataApi, DataApiError } from '@/lib/client/neon/data-api'

try {
  const result = await neonDataApi().query('SELECT * FROM users')
} catch (error) {
  if (error instanceof DataApiError) {
    console.error('Data API error:', error.status, error.message)
    console.error('Error code:', error.code)
    console.error('Details:', error.details)
  }
}
```

## Exports

All utilities are exported from `@/lib/client/neon`:

```typescript
import {
  neonDataApi,
  dataApi,
  DataApiError,
  type DataApiQueryOptions,
  type DataApiResponse,
} from '@/lib/client/neon'
```

## Documentation

- [Data API Optimization Guide](../../../docs/NEON_DATA_API_OPTIMIZATION.md)
- [Data API Quick Start](../../../docs/NEON_DATA_API_QUICKSTART.md)
- [Drizzle RLS Integration](../../../docs/DRIZZLE_RLS_INTEGRATION.md)

## Setup

1. Get Data API URL from Neon Console > Project Settings > Data API
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_NEON_DATA_API_URL=https://your-project.neon.tech/data-api/v1
   ```
3. Start using in your components!
