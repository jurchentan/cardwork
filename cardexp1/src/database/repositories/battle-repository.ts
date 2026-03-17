import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { notImplementedResult } from "./mappers";

export class BattleRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listDailyBattles(): Promise<Result<unknown[]>> {
    void this.db;
    return notImplementedResult("BattleRepository.listDailyBattles is not implemented yet");
  }
}
