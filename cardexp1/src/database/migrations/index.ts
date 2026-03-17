import { migration001InitSchema } from "./001_init_schema";
import { migration002AddSessionTimerCheckpoints } from "./002_add_session_timer_checkpoints";
import type { Migration } from "./types";

export const MIGRATIONS: Migration[] = [migration001InitSchema, migration002AddSessionTimerCheckpoints];

export const LATEST_MIGRATION_VERSION = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;
