# Multitenancy Quick Reference

**Quick reference for multitenancy approaches in Neon**

## Current Architecture

**Approach:** Shared Schema with RLS  
**Schema:** `axis_tenant`  
**Isolation:** Row-Level Security policies  
**Status:** ✅ Well-implemented, suitable for current scale

## When to Use Each Approach

### Shared Schema (Your Current) ✅
- Early-stage applications
- Moderate tenant count (<100)
- Similar tenant patterns
- Need for cross-tenant queries
- Simple management

### Project-per-User ⭐
- High security requirements
- Large tenant count (100+)
- Varying workloads
- Per-tenant backups needed
- Compliance requirements
- Enterprise customers

### Schema-per-User ⚠️
- Not recommended by Neon
- Doesn't provide better isolation
- Limits PITR capabilities

## Optimization Checklist

### Current Shared Schema
- [ ] Add indexes on RLS policy columns
- [ ] Migrate to Drizzle declarative RLS
- [ ] Monitor table growth
- [ ] Track query performance
- [ ] Set up slow query alerts

### Future Project-per-User
- [ ] Implement Neon API integration
- [ ] Create project management utilities
- [ ] Plan data migration strategy
- [ ] Update connection management
- [ ] Test with pilot tenants

## Key Metrics to Monitor

- Table sizes and growth
- Query performance per tenant
- RLS policy execution time
- Connection pool usage
- Slow queries

## Migration Triggers

Consider migrating to project-per-user when:
- Tables >100GB
- 100+ tenants
- Performance degradation
- Security requirements increase
- Need per-tenant backups

## Full Documentation

See [NEON_MULTITENANCY_ARCHITECTURE.md](./NEON_MULTITENANCY_ARCHITECTURE.md) for complete guide.
