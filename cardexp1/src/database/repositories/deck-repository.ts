import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";

import { databaseErrorResult } from "./mappers";

export class DeckRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async addCardToWeeklyDeck(input: {
    id: string;
    weekStartDate: string;
    cardId: string;
    sourceType: string;
    earnedAt: string;
  }): Promise<Result<void>> {
    try {
      await this.db.runAsync(
        "INSERT INTO weekly_decks (id, week_start_date, card_id, source_type, earned_at) VALUES ($id, $week_start_date, $card_id, $source_type, $earned_at)",
        {
          $id: input.id,
          $week_start_date: input.weekStartDate,
          $card_id: input.cardId,
          $source_type: input.sourceType,
          $earned_at: input.earnedAt
        }
      );

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to persist weekly deck reward entry");
    }
  }
}
