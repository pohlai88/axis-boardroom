# Neon Database Best Practices Guide

**Date:** 2026-01-20  
**Project:** AXIS BoardRoom  
**Neon Project ID:** `curly-surf-86073016`  
**Status:** ✅ Production-Ready

## Overview

This guide documents Neon database best practices implemented for the AXIS BoardRoom project, including:
- Connection optimization
- Query performance monitoring
- Branch management
- Health checks
- Migration workflows
- Read replica configuration

## Table of Contents

1. [Connection Management](#connection-management)
2. [Query Performance Monitoring](#query-performance-monitoring)
3. [Branch Management](#branch-management)
4. [Health Checks & Monitoring](#health-checks--monitoring)
5. [Migration Best Practices](#migration-best-practices)
6. [Read Replicas](#read-replicas)
7. [Security Best Practices](#security-best-practices)
8. [Cost Optimization](#cost-optimization)

---

## Connection Management

### ✅ Current Implementation

**File:** `lib/server/drizzle/index.ts`

```typescript
// Neon serverless connection with connection caching
const sql = neon(env.DATABASE_URL, {
  fetchConnectionCache: true, // ✅ Enabled
})
```

### Best Practices

1. **✅ Connection Caching Enabled**
   - Uses `fetchConnectionCache: true` for serverless optimization
   - Reuses connections across invocations when possible
   - Reduces cold start times

2. **✅ Lazy Initialization**
   - Database instance created on first access
   - Prevents unnecessary connections during app startup

3. **✅ HTTP Driver for Serverless**
   - Uses `drizzle-orm/neon-http` (optimal for serverless)
   - Supports simple transactions
   - For complex transactions, consider `neon-websocket`

### When to Use WebSocket Driver

For complex/interactive transactions:

```typescript
import { drizzle } from 'drizzle-orm/neon-websocket'
import { neonConfig, ws } from '@neondatabase/serverless'

neonConfig.webSocketConstructor = ws
```

**Use WebSocket when:**
- Long-running transactions (>30 seconds)
- Interactive transactions with user input
- Complex multi-step operations requiring rollback

**Use HTTP when:**
- Simple CRUD operations ✅ (current setup)
- Serverless environments ✅ (current setup)
- Most application queries ✅ (current setup)

---

## Query Performance Monitoring

### ✅ pg_stat_statements Installed

**Status:** ✅ Installed (version 1.11)

**Installation:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Monitoring Tools

#### 1. Neon MCP - Slow Query Analysis

**Tool:** `list_slow_queries`

```typescript
// Via Neon MCP
mcp_Neon_list_slow_queries({
  projectId: 'curly-surf-86073016',
  limit: 10,
  minExecutionTime: 100 // milliseconds
})
```

**Current Slow Queries:**
- Information schema queries: ~6ms (acceptable)
- Extension updates: ~4ms (acceptable)
- Database size queries: ~3ms (acceptable)

**Action Items:**
- ✅ All queries under 10ms (excellent performance)
- Monitor for queries >100ms
- Set up alerts for queries >500ms

#### 2. Query Tuning Workflow

**Tool:** `prepare_query_tuning` + `complete_query_tuning`

**Workflow:**
1. Identify slow query
2. Use `prepare_query_tuning` to analyze
3. Review suggested optimizations (indexes, query structure)
4. Test on temporary branch
5. Apply with `complete_query_tuning`

**Example:**
```typescript
// Analyze slow query
const tuning = await mcp_Neon_prepare_query_tuning({
  projectId: 'curly-surf-86073016',
  sql: 'SELECT * FROM users WHERE email = $1',
  databaseName: 'neondb'
})

// Review suggestions, then apply
await mcp_Neon_complete_query_tuning({
  projectId: 'curly-surf-86073016',
  tuningId: tuning.tuning_id,
  suggestedSqlStatements: tuning.suggested_sql,
  applyChanges: true
})
```

#### 3. EXPLAIN Analysis

**Tool:** `explain_sql_statement`

```typescript
const plan = await mcp_Neon_explain_sql_statement({
  projectId: 'curly-surf-86073016',
  sql: 'SELECT * FROM users WHERE email = $1',
  analyze: true
})
```

**Key Metrics to Monitor:**
- Execution time
- Index usage
- Sequential scans (should be minimized)
- Buffer hit ratio (should be >95%)

---

## Branch Management

### Current Branches

1. **main** (br-gentle-violet-a1j2yj5b)
   - Primary branch
   - Protected: false (consider enabling)
   - Size: 34.4 MB

2. **dev-seeding** (br-red-fire-a18jc37q)
   - Development branch for seeding
   - Size: 34.7 MB

3. **br-little-bird-a1gusmup**
   - Temporary branch
   - Consider cleanup

### Best Practices

#### 1. Branch Naming Convention

✅ **Good:**
- `dev-seeding`
- `feature-user-auth`
- `staging`

❌ **Avoid:**
- Auto-generated IDs
- Unclear purpose

#### 2. Branch Lifecycle

**Create Branch:**
```typescript
await mcp_Neon_create_branch({
  projectId: 'curly-surf-86073016',
  branchName: 'feature-new-feature'
})
```

**Reset Branch:**
```typescript
await mcp_Neon_reset_from_parent({
  projectId: 'curly-surf-86073016',
  branchIdOrName: 'feature-new-feature'
})
```

**Delete Branch:**
```typescript
await mcp_Neon_delete_branch({
  projectId: 'curly-surf-86073016',
  branchId: 'branch-id'
})
```

#### 3. Branch Protection

**Recommendation:** Enable protection for `main` branch

**Benefits:**
- Prevents accidental deletion
- Requires explicit confirmation for destructive operations
- Better for production safety

#### 4. Branch Cleanup

**Regular Cleanup:**
- Delete unused branches monthly
- Keep only active development branches
- Archive important branches before deletion

---

## Health Checks & Monitoring

### Current Implementation

**File:** `lib/server/drizzle/index.ts`

```typescript
export async function checkDbHealth(): Promise<{ healthy: boolean; error?: string }> {
  if (!isDbAvailable()) {
    return { healthy: false, error: 'Database not initialized' }
  }

  try {
    await db.execute(sql`SELECT 1`)
    return { healthy: true }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

### Enhanced Health Check (Recommended)

**File:** `lib/server/drizzle/health.ts` (to be created)

```typescript
export async function enhancedHealthCheck() {
  return {
    connection: await checkDbHealth(),
    extensions: await checkExtensions(),
    slowQueries: await checkSlowQueries(),
    replication: await checkReplication(),
    branch: await checkBranchStatus()
  }
}
```

### Monitoring Endpoints

**Current:** `/api/health` (basic)

**Recommended:** Enhanced health endpoint with:
- Database connection status
- Query performance metrics
- Extension status
- Branch information

---

## Migration Best Practices

### Workflow

1. **Prepare Migration**
   ```typescript
   await mcp_Neon_prepare_database_migration({
     projectId: 'curly-surf-86073016',
     migrationSql: 'ALTER TABLE users ADD COLUMN last_login TIMESTAMP',
     databaseName: 'neondb'
   })
   ```

2. **Test on Temporary Branch**
   - Migration creates temporary branch automatically
   - Test migration in isolation
   - Verify data integrity

3. **Complete Migration**
   ```typescript
   await mcp_Neon_complete_database_migration({
     projectId: 'curly-surf-86073016',
     migrationId: 'migration-id'
   })
   ```

### Best Practices

1. **Always Test First**
   - Use temporary branches
   - Verify on development branch
   - Test rollback procedures

2. **Use Transactions**
   - Wrap migrations in transactions when possible
   - Atomic operations prevent partial failures

3. **Version Control**
   - Track migrations in Drizzle
   - Use descriptive migration names
   - Document breaking changes

4. **Backup Before Major Changes**
   - Create branch snapshot
   - Test rollback procedure
   - Document recovery steps

---

## Read Replicas

### Current Setup

**File:** `lib/server/drizzle/read-replica.ts`

**Status:** ✅ Implemented, requires `DATABASE_REPLICA_URL`

### Configuration

**Environment Variable:**
```env
DATABASE_REPLICA_URL=postgresql://...
```

**Usage:**
```typescript
import { db } from '@/lib/server/drizzle/read-replica'

// Automatic routing:
// SELECT → replica
// INSERT/UPDATE/DELETE → primary

// Force primary read
const users = await db.$primary.select().from(users)
```

### Best Practices

1. **Read-Heavy Workloads**
   - Use replicas for analytics queries
   - Use replicas for reporting
   - Use replicas for read-only operations

2. **Write Operations**
   - Always use primary
   - Drizzle automatically routes writes

3. **Consistency**
   - Replicas may have slight lag (<1s typically)
   - Use primary for critical reads requiring latest data

4. **Monitoring**
   - Monitor replica lag
   - Alert on high lag (>5s)
   - Monitor replica health

---

## Security Best Practices

### ✅ Current Implementation

1. **Connection String Security**
   - Stored in environment variables
   - Never committed to git
   - Validated with Zod

2. **RLS Policies**
   - Row-level security enabled
   - Multi-tenant isolation
   - Schema-based access control

3. **IP Restrictions**
   - Configurable via Neon Console
   - VPC connections supported
   - Public connections can be blocked

### Recommendations

1. **Enable IP Restrictions (Production)**
   ```typescript
   // In Neon Console:
   // Settings → Allowed IPs
   // Add production server IPs
   ```

2. **Use Connection Pooling**
   - Neon handles pooling automatically
   - Monitor connection count
   - Set appropriate limits

3. **Audit Logging**
   - Enable audit logs for sensitive operations
   - Track schema changes
   - Monitor access patterns

4. **Backup Strategy**
   - Point-in-time recovery enabled
   - Regular backup verification
   - Test restore procedures

---

## Cost Optimization

### Current Configuration

**Project:** AXIS
- **Autoscaling:** 0.25 - 2 CU
- **Suspend Timeout:** 0 (always on)
- **Storage:** 37.8 MB

### Optimization Strategies

1. **Autoscaling**
   - ✅ Configured (0.25 - 2 CU)
   - Monitor usage patterns
   - Adjust limits based on traffic

2. **Suspend Timeout**
   - Current: 0 (always on)
   - Consider: 300s (5 minutes) for dev branches
   - Production: Keep at 0

3. **Branch Management**
   - Delete unused branches
   - Suspend inactive branches
   - Use branches for testing only

4. **Query Optimization**
   - Monitor slow queries
   - Add indexes strategically
   - Use connection pooling
   - Cache frequently accessed data

5. **Storage Optimization**
   - Regular cleanup of old data
   - Archive historical data
   - Monitor table sizes
   - Use partitioning for large tables

### Monitoring Costs

**Key Metrics:**
- Compute Units (CU) usage
- Storage size
- Data transfer
- Active time

**Tools:**
- Neon Console dashboard
- Cost alerts
- Usage reports

---

## Quick Reference

### Common Operations

#### Check Slow Queries
```typescript
await mcp_Neon_list_slow_queries({
  projectId: 'curly-surf-86073016',
  limit: 10,
  minExecutionTime: 100
})
```

#### Create Development Branch
```typescript
await mcp_Neon_create_branch({
  projectId: 'curly-surf-86073016',
  branchName: 'dev-feature-name'
})
```

#### Run Migration
```typescript
await mcp_Neon_prepare_database_migration({
  projectId: 'curly-surf-86073016',
  migrationSql: 'ALTER TABLE...',
  databaseName: 'neondb'
})
```

#### Get Connection String
```typescript
await mcp_Neon_get_connection_string({
  projectId: 'curly-surf-86073016',
  branchId: 'branch-id'
})
```

#### Explain Query
```typescript
await mcp_Neon_explain_sql_statement({
  projectId: 'curly-surf-86073016',
  sql: 'SELECT * FROM users',
  analyze: true
})
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://...

# Optional
DATABASE_REPLICA_URL=postgresql://... # For read replicas
```

### Scripts

**Check Health:**
```bash
npm run db:health
```

**List Slow Queries:**
```bash
npm run db:slow-queries
```

**Create Branch:**
```bash
npm run db:branch:create --name=dev-feature
```

---

## Next Steps

1. ✅ Install pg_stat_statements (completed)
2. ⏳ Set up automated slow query alerts
3. ⏳ Enable branch protection for main
4. ⏳ Create enhanced health check endpoint
5. ⏳ Set up query performance dashboard
6. ⏳ Implement cost monitoring alerts
7. ⏳ Document rollback procedures
8. ⏳ Set up automated backup verification

---

## Resources

### Official Neon Documentation
- [Neon Connection Guide](https://neon.com/docs/connect/connect-intro) - Complete connection documentation
- [Choose a driver and connection type](https://neon.com/docs/connect/choose-connection) - Driver selection
- [Serverless driver](https://neon.com/docs/serverless/serverless-driver) - Serverless-specific docs
- [Connection pooling](https://neon.com/docs/connect/connection-pooling) - Pooling configuration
- [Connect securely](https://neon.com/docs/connect/connect-securely) - SSL/TLS security
- [Connection errors](https://neon.com/docs/connect/connection-errors) - Troubleshooting
- [Connection latency](https://neon.com/docs/connect/connection-latency) - Performance optimization

### Framework & Tools
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started/neon-new)
- [Neon MCP Tools](https://neon.tech/docs/develop/mcp)
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)

### Project Documentation
- [Neon Connection Setup](./NEON_CONNECTION_SETUP.md) - Setup guide
- [Neon Connection Reference](./NEON_CONNECTION_REFERENCE.md) - Quick reference

---

**Last Updated:** 2026-01-20  
**Maintained By:** Development Team  
**Status:** ✅ Active
