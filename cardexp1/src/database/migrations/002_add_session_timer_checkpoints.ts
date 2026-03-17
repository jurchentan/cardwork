import type { Migration } from "./types";

export const migration002AddSessionTimerCheckpoints: Migration = {
  version: 2,
  name: "add_session_timer_checkpoints",
  sql: `
ALTER TABLE sessions ADD COLUMN accumulated_ms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sessions ADD COLUMN last_checkpoint_at TEXT;
UPDATE sessions
SET accumulated_ms = COALESCE(duration_seconds, 0) * 1000,
    last_checkpoint_at = COALESCE(last_checkpoint_at, started_at)
WHERE last_checkpoint_at IS NULL;
`
};
