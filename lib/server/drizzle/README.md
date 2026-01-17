# Drizzle Seeding

This directory contains database seeding scripts using `drizzle-seed`.

## Quick Start

```bash
# Seed with default count (100 records per table)
npm run db:seed

# Seed with custom count
npm run db:seed -- 1000

# Reset database and seed (clears all data first)
npm run db:seed:reset

# Reset and seed with custom count
npm run db:seed:reset -- 50
```

## Files

- `seed.ts` - Main seeding script using drizzle-seed generators
- `seed-structured.ts.example` - Example of structured JSON seeding
- `README.md` - This file

## What Gets Seeded

The seed script generates realistic test data with **relationships**:

### Multi-Tenant Schema (`axis_tenant`)
- **Organizations** (count) - Company names, slugs, domains, settings
  - Each organization gets **3 teams** automatically
  - Each organization gets **10 memberships** automatically
- **Teams** - Team names, descriptions, hierarchy (created via relationships)
- **Memberships** - User-org-team relationships with roles (created via relationships)

### Analytics Schema (`public`)
- **Web Vitals** (count) - Performance metrics (FCP, LCP, FID, CLS, TTFB, INP)
- **Errors** (count) - Error tracking data
- **Analytics Aggregates** (count) - Aggregated metrics with percentiles

**Example:** `npm run db:seed -- 10` creates:
- 10 organizations
- 30 teams (10 orgs × 3 teams)
- 100 memberships (10 orgs × 10 memberships)
- 10 web vitals
- 10 errors
- 10 analytics aggregates

## Generator Functions Used

- `companyName()` - Realistic company names
- `string()` - Text fields with length constraints
- `valuesFromArray()` - Enum-like values (status, roles, etc.)
- `int()` / `number()` - Numeric values
- `uuid()` - UUID identifiers
- `timestamp()` - Date/time values
- `json()` - JSON objects
- `loremIpsum()` - Descriptive text

## Features

### ✅ Reset Functionality
Clear all data before seeding:
```bash
npm run db:seed:reset
```

### ✅ Relationships
Automatic relationship creation using `with` option:
- Each organization automatically gets teams and memberships
- Foreign keys are properly linked

### ✅ Versioning
Generator version is locked (`1`) for consistency:
- Same seed value produces same data
- Reproducible test data

### ✅ Deterministic Seeding
Use a seed value for reproducible data:
```typescript
seedDatabase(100, { seed: 12345 }) // Same seed = same data
```

## Customization

Edit `seed.ts` to customize:
- Field generators
- Data ranges
- Enum values
- Relationship counts (in `with` option)
- Seed version

## References

- [Drizzle Seed Functions](https://orm.drizzle.team/docs/seed-functions)
- [Drizzle Seed Versioning](https://orm.drizzle.team/docs/seed-versioning)
