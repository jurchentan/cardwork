import * as SQLite from "expo-sqlite";

import { runMigrations } from "@/database/migration-runner";

export const DATABASE_NAME = "cardwork.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabase();
      await runMigrations(db);
      return db;
    })();
  }

  return databasePromise;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initializeDatabase();
}
