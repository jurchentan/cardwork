import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";
import type { CardDraft } from "@/features/cards/domain/card-award";

import { databaseErrorResult } from "./mappers";

export class CardRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async createCard(card: CardDraft): Promise<Result<void>> {
    try {
      await this.db.runAsync(
        "INSERT INTO cards (id, card_name, card_type_tag, damage_value, shield_value, effect_description, selective_cost_notation, synergy_description, created_at) VALUES ($id, $card_name, $card_type_tag, $damage_value, $shield_value, $effect_description, $selective_cost_notation, $synergy_description, $created_at)",
        {
          $id: card.id,
          $card_name: card.cardName,
          $card_type_tag: card.cardTypeTag,
          $damage_value: card.damageValue,
          $shield_value: card.shieldValue,
          $effect_description: card.effectDescription,
          $selective_cost_notation: card.selectiveCostNotation,
          $synergy_description: card.synergyDescription,
          $created_at: card.createdAt
        }
      );

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to persist awarded card");
    }
  }
}
