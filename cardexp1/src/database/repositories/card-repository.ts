import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { notImplementedResult } from "./mappers";

export class CardRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listCards(): Promise<Result<unknown[]>> {
    void this.db;
    return notImplementedResult("CardRepository.listCards is not implemented yet");
  }
}
