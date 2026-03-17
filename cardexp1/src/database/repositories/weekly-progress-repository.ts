import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { notImplementedResult } from "./mappers";

export class WeeklyProgressRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getMetaProgress(): Promise<Result<unknown>> {
    void this.db;
    return notImplementedResult("WeeklyProgressRepository.getMetaProgress is not implemented yet");
  }
}
