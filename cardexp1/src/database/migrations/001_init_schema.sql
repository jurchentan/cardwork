CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  integrity_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_intents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  intent_text TEXT NOT NULL,
  input_mode TEXT NOT NULL,
  work_type_tag TEXT,
  classifier_source TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_reflections (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  reflection_text TEXT,
  reflection_mode TEXT NOT NULL,
  plausibility_status TEXT NOT NULL,
  revenge_task_assigned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  card_name TEXT NOT NULL,
  card_type_tag TEXT NOT NULL,
  damage_value INTEGER NOT NULL DEFAULT 0,
  shield_value INTEGER NOT NULL DEFAULT 0,
  effect_description TEXT NOT NULL,
  selective_cost_notation TEXT,
  synergy_description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS weekly_decks (
  id TEXT PRIMARY KEY,
  week_start_date TEXT NOT NULL,
  card_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS battles_daily (
  id TEXT PRIMARY KEY,
  battle_date TEXT NOT NULL,
  outcome TEXT NOT NULL,
  stage_reached INTEGER NOT NULL DEFAULT 1,
  rewards_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS battles_weekly (
  id TEXT PRIMARY KEY,
  week_start_date TEXT NOT NULL,
  outcome TEXT NOT NULL,
  stage_reached INTEGER NOT NULL DEFAULT 0,
  meta_xp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS epics (
  id TEXT PRIMARY KEY,
  week_start_date TEXT NOT NULL,
  declaration_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta_progress (
  id TEXT PRIMARY KEY,
  total_meta_xp INTEGER NOT NULL DEFAULT 0,
  last_weekly_reset_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox_ai_requests (
  id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  retries INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_weekly_decks_week_start_date ON weekly_decks(week_start_date);
CREATE INDEX IF NOT EXISTS idx_battles_daily_battle_date ON battles_daily(battle_date);
CREATE INDEX IF NOT EXISTS idx_battles_weekly_week_start_date ON battles_weekly(week_start_date);
CREATE INDEX IF NOT EXISTS idx_outbox_ai_requests_status ON outbox_ai_requests(status);
