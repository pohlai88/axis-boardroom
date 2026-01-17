-- Migration: Create R2 Files Table
-- Description: Stores metadata for files uploaded to Cloudflare R2
-- Reference: https://neon.com/docs/guides/cloudflare-r2

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_r2_files_user_id ON r2_files(user_id);
CREATE INDEX IF NOT EXISTS idx_r2_files_organization_id ON r2_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_r2_files_upload_timestamp ON r2_files(upload_timestamp DESC);

-- Optional: Enable Row-Level Security
-- ALTER TABLE r2_files ENABLE ROW LEVEL SECURITY;
-- 
-- -- Policy: Users can only see their own files
-- CREATE POLICY "Users can view own files"
--   ON r2_files
--   FOR SELECT
--   USING (user_id = current_setting('app.user_id', true));
-- 
-- -- Policy: Users can only insert their own files
-- CREATE POLICY "Users can insert own files"
--   ON r2_files
--   FOR INSERT
--   WITH CHECK (user_id = current_setting('app.user_id', true));

COMMENT ON TABLE r2_files IS 'Stores metadata for files uploaded to Cloudflare R2';
COMMENT ON COLUMN r2_files.object_key IS 'The key (path/filename) in R2 bucket';
COMMENT ON COLUMN r2_files.file_url IS 'Publicly accessible URL (if bucket is public)';
COMMENT ON COLUMN r2_files.user_id IS 'User who uploaded the file';
COMMENT ON COLUMN r2_files.organization_id IS 'Optional organization association for multi-tenant scenarios';
