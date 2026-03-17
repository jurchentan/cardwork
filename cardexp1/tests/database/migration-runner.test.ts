import assert from "node:assert/strict";
import test from "node:test";

import { MIGRATIONS } from "@/database/migrations";
import { getPendingMigrations, runMigrations } from "@/database/migration-runner";
import type { MigrationDatabase } from "@/database/migration-runner";

class FakeMigrationDatabase implements MigrationDatabase {
  private userVersion = 0;
  private readonly tables = new Set<string>();
  private userVersionWrites = 0;

  constructor(initialUserVersion = 0) {
    this.userVersion = initialUserVersion;
  }

  async getFirstAsync<T>(source: string): Promise<T | null> {
    if (/PRAGMA\s+user_version/i.test(source)) {
      return { user_version: this.userVersion } as T;
    }

    return null;
  }

  async execAsync(source: string): Promise<void> {
    const statements = source
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      const createTableMatch = statement.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z_]+)/i);
      if (createTableMatch) {
        this.tables.add(createTableMatch[1]);
      }

      const userVersionMatch = statement.match(/PRAGMA\s+user_version\s*=\s*(\d+)/i);
      if (userVersionMatch) {
        this.userVersion = Number(userVersionMatch[1]);
        this.userVersionWrites += 1;
      }
    }
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  hasTable(tableName: string): boolean {
    return this.tables.has(tableName);
  }

  getUserVersion(): number {
    return this.userVersion;
  }

  getUserVersionWrites(): number {
    return this.userVersionWrites;
  }
}

test("getPendingMigrations returns pending versions in ascending order", () => {
  const pending = getPendingMigrations(0, [
    { version: 3, name: "three", sql: "" },
    { version: 1, name: "one", sql: "" },
    { version: 2, name: "two", sql: "" }
  ]);

  assert.deepEqual(
    pending.map((migration) => migration.version),
    [1, 2, 3]
  );
});

test("getPendingMigrations supports partial upgrade and latest no-op", () => {
  const available = [
    { version: 1, name: "one", sql: "" },
    { version: 2, name: "two", sql: "" },
    { version: 3, name: "three", sql: "" }
  ];

  assert.deepEqual(
    getPendingMigrations(1, available).map((migration) => migration.version),
    [2, 3]
  );
  assert.deepEqual(getPendingMigrations(3, available), []);
});

test("runMigrations creates required tables and updates user_version", async () => {
  const db = new FakeMigrationDatabase();

  await runMigrations(db);

  for (const requiredTable of [
    "sessions",
    "session_intents",
    "session_reflections",
    "cards",
    "weekly_decks",
    "battles_daily",
    "battles_weekly",
    "epics",
    "meta_progress",
    "outbox_ai_requests"
  ]) {
    assert.equal(db.hasTable(requiredTable), true, `${requiredTable} must exist after migration`);
  }

  assert.equal(db.getUserVersion(), MIGRATIONS[MIGRATIONS.length - 1].version);
});

test("runMigrations is deterministic and does not reapply when up-to-date", async () => {
  const latestVersion = MIGRATIONS[MIGRATIONS.length - 1].version;
  const db = new FakeMigrationDatabase(latestVersion);

  await runMigrations(db);

  assert.equal(db.getUserVersion(), latestVersion);
  assert.equal(db.getUserVersionWrites(), 0, "no user_version rewrite expected when already current");
});
