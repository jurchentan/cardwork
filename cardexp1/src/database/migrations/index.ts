import { migration001InitSchema } from "./001_init_schema";
import type { Migration } from "./types";

export const MIGRATIONS: Migration[] = [migration001InitSchema];

export const LATEST_MIGRATION_VERSION = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;
