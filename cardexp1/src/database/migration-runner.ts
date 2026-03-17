import { LATEST_MIGRATION_VERSION, MIGRATIONS } from "@/database/migrations";
import type { Migration } from "@/database/migrations/types";

export type MigrationDatabase = {
  getFirstAsync<T>(source: string): Promise<T | null>;
  execAsync(source: string): Promise<void>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

export async function readUserVersion(db: MigrationDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version?: number }>("PRAGMA user_version");
  return row?.user_version ?? 0;
}

export function getPendingMigrations(
  currentVersion: number,
  availableMigrations: Migration[] = MIGRATIONS
): Migration[] {
  return [...availableMigrations]
    .sort((left, right) => left.version - right.version)
    .filter((migration) => migration.version > currentVersion);
}

export async function runMigrations(db: MigrationDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const currentVersion = await readUserVersion(db);
  const pendingMigrations = getPendingMigrations(currentVersion);

  for (const migration of pendingMigrations) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }
}

export { LATEST_MIGRATION_VERSION };
