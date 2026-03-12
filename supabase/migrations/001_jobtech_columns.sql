-- Migration: Add columns for JobTech API integration
-- Run this in Supabase SQL Editor before using the sync feature

-- Make company_id nullable so external jobs don't need a company record
ALTER TABLE jobs ALTER COLUMN company_id DROP NOT NULL;

-- Add columns for external job sources
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id       text UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source            text NOT NULL DEFAULT 'manual';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_url      text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_external       boolean NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name_override     text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo_url_override text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_synced_at    timestamptz;

-- Index for fast lookups by external_id during upsert
CREATE INDEX IF NOT EXISTS jobs_external_id_idx ON jobs(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS jobs_source_idx ON jobs(source);
CREATE INDEX IF NOT EXISTS jobs_last_synced_idx ON jobs(last_synced_at) WHERE is_external = true;
