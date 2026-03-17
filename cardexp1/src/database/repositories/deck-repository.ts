import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { notImplementedResult } from "./mappers";

export class DeckRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listWeeklyDeckEntries(): Promise<Result<unknown[]>> {
    void this.db;
    return notImplementedResult("DeckRepository.listWeeklyDeckEntries is not implemented yet");
  }
}
