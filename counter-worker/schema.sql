CREATE TABLE IF NOT EXISTS counters (
  key   TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- Optional: start from an existing count instead of 0.
-- INSERT INTO counters (key, value) VALUES ('views', 0)
--   ON CONFLICT(key) DO UPDATE SET value = excluded.value;
