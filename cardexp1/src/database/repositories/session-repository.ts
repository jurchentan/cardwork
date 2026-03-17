import type { SQLiteDatabase } from "expo-sqlite";

import type { Result } from "@/shared/result/result";
import type {
  SessionIntentRecord,
  SessionRecord,
  StartSessionInput
} from "@/features/sessions/domain/session-start";

import { databaseErrorResult, mapRowToCamelCase } from "./mappers";

type SessionRepositoryDatabase = Pick<
  SQLiteDatabase,
  "withTransactionAsync"
> & {
  runAsync(source: string, params?: unknown): Promise<unknown>;
  getAllAsync<T>(source: string, params?: unknown): Promise<T[]>;
};

type SessionRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  integrity_status: string;
  created_at: string;
  updated_at: string;
};

type SessionIntentRow = {
  id: string;
  session_id: string;
  intent_text: string;
  input_mode: string;
  work_type_tag: string | null;
  classifier_source: string | null;
  created_at: string;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class SessionRepository {
  constructor(private readonly db: SessionRepositoryDatabase) {}

  async startSession(input: StartSessionInput): Promise<Result<SessionRecord>> {
    const nowIso = new Date().toISOString();
    const sessionId = createId("session");
    const sessionIntentId = createId("intent");

    try {
      await this.db.withTransactionAsync(async () => {
        await this.db.runAsync(
          "INSERT INTO sessions (id, started_at, ended_at, duration_seconds, integrity_status, created_at, updated_at) VALUES ($id, $started_at, $ended_at, $duration_seconds, $integrity_status, $created_at, $updated_at)",
          {
            $id: sessionId,
            $started_at: nowIso,
            $ended_at: null,
            $duration_seconds: 0,
            $integrity_status: "running",
            $created_at: nowIso,
            $updated_at: nowIso
          }
        );

        await this.db.runAsync(
          "INSERT INTO session_intents (id, session_id, intent_text, input_mode, work_type_tag, classifier_source, created_at) VALUES ($id, $session_id, $intent_text, $input_mode, $work_type_tag, $classifier_source, $created_at)",
          {
            $id: sessionIntentId,
            $session_id: sessionId,
            $intent_text: input.intentText,
            $input_mode: input.inputMode,
            $work_type_tag: null,
            $classifier_source: "manual",
            $created_at: nowIso
          }
        );
      });

      return {
        ok: true,
        data: {
          id: sessionId,
          startedAt: nowIso,
          endedAt: null,
          durationSeconds: 0,
          integrityStatus: "running",
          createdAt: nowIso,
          updatedAt: nowIso
        }
      };
    } catch {
      return databaseErrorResult("Unable to persist session start data");
    }
  }

  async listSessions(): Promise<Result<SessionRecord[]>> {
    try {
      const rows = await this.db.getAllAsync<SessionRow>(
        "SELECT id, started_at, ended_at, duration_seconds, integrity_status, created_at, updated_at FROM sessions ORDER BY created_at ASC"
      );

      return {
        ok: true,
        data: rows.map((row) => mapRowToCamelCase<SessionRecord>(row))
      };
    } catch {
      return databaseErrorResult("Unable to read sessions");
    }
  }

  async listSessionIntentsBySessionId(sessionId: string): Promise<Result<SessionIntentRecord[]>> {
    try {
      const rows = await this.db.getAllAsync<SessionIntentRow>(
        "SELECT id, session_id, intent_text, input_mode, work_type_tag, classifier_source, created_at FROM session_intents WHERE session_id = $session_id ORDER BY created_at ASC",
        { $session_id: sessionId }
      );

      return {
        ok: true,
        data: rows.map((row) => mapRowToCamelCase<SessionIntentRecord>(row))
      };
    } catch {
      return databaseErrorResult("Unable to read session intents");
    }
  }
}
