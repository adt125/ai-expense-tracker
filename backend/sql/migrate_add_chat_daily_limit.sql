-- Adds daily chat limiter fields to existing databases.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS user_settings
  ADD COLUMN IF NOT EXISTS chat_daily_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS user_settings
  ADD COLUMN IF NOT EXISTS chat_daily_date DATE;

-- Optional cleanup (only if you ran the previous version that created this table):
-- DROP TABLE IF EXISTS chat_daily_usage;

