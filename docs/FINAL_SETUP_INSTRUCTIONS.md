# Final Setup Instructions

**Date:** 2026-01-20  
**Status:** ✅ Ready to Complete

## Quick Setup Checklist

### ✅ 1. Environment Configuration

Your `.env.local` file should contain all R2 and Neon variables. Make sure:
- ✅ `DATABASE_URL` has the **actual password** (not `***`)
- ✅ All R2 variables are present
- ✅ All Neon variables are present

### ✅ 2. Create R2 Database Table

You have **two options**:

#### Option A: Using Drizzle (Recommended)

```bash
npm run db:push
```

This will create the `r2_files` table based on your schema definition.

#### Option B: Manual SQL

Connect to your database and run:

```sql
CREATE TABLE IF NOT EXISTS r2_files (
    id SERIAL PRIMARY KEY,
    object_key TEXT NOT NULL UNIQUE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_size TEXT,
    user_id TEXT NOT NULL,
    organization_id UUID,
    upload_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_r2_files_user_id ON r2_files(user_id);
CREATE INDEX IF NOT EXISTS idx_r2_files_organization_id ON r2_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_r2_files_upload_timestamp ON r2_files(upload_timestamp DESC);
```

### ✅ 3. Verify Configuration

Test that everything works:

```bash
# Test R2 configuration
curl -X POST http://localhost:3000/api/r2/presign-upload \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.png", "contentType": "image/png"}'
```

Or visit: http://localhost:3000/neon-data-api-demo

## Important Notes

### DATABASE_URL Password

If you see `password authentication failed`, check your `.env.local`:

```bash
# ❌ Wrong (masked password)
DATABASE_URL="postgresql://user:***@host/db"

# ✅ Correct (actual password)
DATABASE_URL="postgresql://user:actual_password_here@host/db"
```

### R2 Configuration

All R2 variables are optional in the schema, but required for R2 to work:

```bash
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=axis-attachments
```

## Next Steps

1. ✅ Fix DATABASE_URL password if needed
2. ✅ Run `npm run db:push` to create table
3. ✅ Test the integration
4. ✅ Start using R2 uploads!

---

**You're almost there!** Just create the database table and you're ready to go! 🚀
