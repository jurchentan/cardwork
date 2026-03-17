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
  accumulated_ms: number;
  last_checkpoint_at: string | null;
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
          "INSERT INTO sessions (id, started_at, ended_at, duration_seconds, accumulated_ms, last_checkpoint_at, integrity_status, created_at, updated_at) VALUES ($id, $started_at, $ended_at, $duration_seconds, $accumulated_ms, $last_checkpoint_at, $integrity_status, $created_at, $updated_at)",
          {
            $id: sessionId,
            $started_at: nowIso,
            $ended_at: null,
            $duration_seconds: 0,
            $accumulated_ms: 0,
            $last_checkpoint_at: nowIso,
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
          accumulatedMs: 0,
          lastCheckpointAt: nowIso,
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
        "SELECT id, started_at, ended_at, duration_seconds, accumulated_ms, last_checkpoint_at, integrity_status, created_at, updated_at FROM sessions ORDER BY created_at ASC"
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

  async getSessionForRewardClaim(sessionId: string): Promise<Result<SessionRecord>> {
    try {
      const rows = await this.db.getAllAsync<SessionRow>(
        "SELECT id, started_at, ended_at, duration_seconds, accumulated_ms, last_checkpoint_at, integrity_status, created_at, updated_at FROM sessions WHERE id = $id LIMIT 1",
        { $id: sessionId }
      );

      const session = rows[0];
      if (!session) {
        return {
          ok: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: "Session record was not found",
            retriable: false
          }
        };
      }

      return {
        ok: true,
        data: mapRowToCamelCase<SessionRecord>(session)
      };
    } catch {
      return databaseErrorResult("Unable to read session for reward claim");
    }
  }

  async saveIntegrityCheckpoint(params: {
    sessionId: string;
    accumulatedMs: number;
    lastCheckpointAt: string;
  }): Promise<Result<void>> {
    try {
      await this.db.runAsync(
        "UPDATE sessions SET accumulated_ms = $accumulated_ms, last_checkpoint_at = $last_checkpoint_at, updated_at = $updated_at WHERE id = $id",
        {
          $id: params.sessionId,
          $accumulated_ms: params.accumulatedMs,
          $last_checkpoint_at: params.lastCheckpointAt,
          $updated_at: params.lastCheckpointAt
        }
      );

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to persist session checkpoint");
    }
  }

  async markSessionBlockedByIntegrityGate(params: {
    sessionId: string;
    accumulatedMs: number;
    lastCheckpointAt: string;
  }): Promise<Result<void>> {
    try {
      await this.db.runAsync(
        "UPDATE sessions SET accumulated_ms = $accumulated_ms, last_checkpoint_at = $last_checkpoint_at, integrity_status = $integrity_status, updated_at = $updated_at WHERE id = $id",
        {
          $id: params.sessionId,
          $accumulated_ms: params.accumulatedMs,
          $last_checkpoint_at: params.lastCheckpointAt,
          $integrity_status: "blocked",
          $updated_at: params.lastCheckpointAt
        }
      );

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to mark session as blocked by integrity gate");
    }
  }

  async updateIntegrityForRewardAttempt(params: {
    sessionId: string;
    accumulatedMs: number;
    lastCheckpointAt: string;
    integrityStatus: "blocked" | "ready_for_reward";
  }): Promise<Result<void>> {
    try {
      await this.db.withTransactionAsync(async () => {
        await this.db.runAsync(
          "UPDATE sessions SET accumulated_ms = $accumulated_ms, last_checkpoint_at = $last_checkpoint_at, integrity_status = $integrity_status, updated_at = $updated_at WHERE id = $id",
          {
            $id: params.sessionId,
            $accumulated_ms: params.accumulatedMs,
            $last_checkpoint_at: params.lastCheckpointAt,
            $integrity_status: params.integrityStatus,
            $updated_at: params.lastCheckpointAt
          }
        );
      });

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to update session integrity state for reward attempt");
    }
  }

  async markSessionReadyForReward(params: {
    sessionId: string;
    accumulatedMs: number;
    lastCheckpointAt: string;
  }): Promise<Result<void>> {
    try {
      await this.db.runAsync(
        "UPDATE sessions SET accumulated_ms = $accumulated_ms, last_checkpoint_at = $last_checkpoint_at, integrity_status = $integrity_status, updated_at = $updated_at WHERE id = $id",
        {
          $id: params.sessionId,
          $accumulated_ms: params.accumulatedMs,
          $last_checkpoint_at: params.lastCheckpointAt,
          $integrity_status: "ready_for_reward",
          $updated_at: params.lastCheckpointAt
        }
      );

      return { ok: true, data: undefined };
    } catch {
      return databaseErrorResult("Unable to mark session ready for reward");
    }
  }

  async getLatestRunningSession(): Promise<Result<SessionRecord | null>> {
    try {
      const rows = await this.db.getAllAsync<SessionRow>(
        "SELECT id, started_at, ended_at, duration_seconds, accumulated_ms, last_checkpoint_at, integrity_status, created_at, updated_at FROM sessions WHERE ended_at IS NULL ORDER BY created_at DESC LIMIT 1"
      );

      if (!rows[0]) {
        return { ok: true, data: null };
      }

      return {
        ok: true,
        data: mapRowToCamelCase<SessionRecord>(rows[0])
      };
    } catch {
      return databaseErrorResult("Unable to read active session");
    }
  }
}
