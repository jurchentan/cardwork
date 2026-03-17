import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { notImplementedResult } from "./mappers";

export class SessionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listSessions(): Promise<Result<unknown[]>> {
    void this.db;
    return notImplementedResult("SessionRepository.listSessions is not implemented yet");
  }
}
