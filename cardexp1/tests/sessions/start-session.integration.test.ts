import assert from "node:assert/strict";
import test from "node:test";

import { SessionRepository } from "@/database/repositories/session-repository";
import { startSession } from "@/features/sessions/application/start-session";
import {
  getSessionHomePrimaryActionRoute,
  HOME_TO_RUNNING_SESSION_TAP_COUNT
} from "@/features/sessions/ui/session-start-flow";

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

class FakeSessionDatabase {
  private readonly sessions: SessionRow[] = [];
  private readonly sessionIntents: SessionIntentRow[] = [];

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  async runAsync(source: string, params: Record<string, unknown>): Promise<void> {
    if (source.includes("INSERT INTO sessions")) {
      this.sessions.push({
        id: String(params.$id),
        started_at: String(params.$started_at),
        ended_at: (params.$ended_at as string | null) ?? null,
        duration_seconds: Number(params.$duration_seconds),
        integrity_status: String(params.$integrity_status),
        created_at: String(params.$created_at),
        updated_at: String(params.$updated_at)
      });
      return;
    }

    if (source.includes("INSERT INTO session_intents")) {
      this.sessionIntents.push({
        id: String(params.$id),
        session_id: String(params.$session_id),
        intent_text: String(params.$intent_text),
        input_mode: String(params.$input_mode),
        work_type_tag: (params.$work_type_tag as string | null) ?? null,
        classifier_source: (params.$classifier_source as string | null) ?? null,
        created_at: String(params.$created_at)
      });
    }
  }

  async getAllAsync<T>(source: string, params?: Record<string, unknown>): Promise<T[]> {
    if (source.includes("FROM sessions")) {
      return this.sessions as T[];
    }

    if (source.includes("FROM session_intents") && params?.$session_id) {
      return this.sessionIntents.filter((row) => row.session_id === params.$session_id) as T[];
    }

    return [];
  }
}

test("home start flow remains two taps and points to /session", () => {
  assert.equal(getSessionHomePrimaryActionRoute(), "/session");
  assert.equal(HOME_TO_RUNNING_SESSION_TAP_COUNT, 2);
});

test("start session persists session and linked intent", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await startSession(repository, {
    intentText: "Write 300 words",
    inputMode: "voice"
  });

  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected startSession to succeed");
  }

  const sessionsResult = await repository.listSessions();
  assert.equal(sessionsResult.ok, true);
  if (!sessionsResult.ok) {
    throw new Error("expected listSessions to succeed");
  }

  assert.equal(sessionsResult.data.length, 1);
  const session = sessionsResult.data[0];
  assert.equal(session.integrityStatus, "running");

  const intentsResult = await repository.listSessionIntentsBySessionId(session.id);
  assert.equal(intentsResult.ok, true);
  if (!intentsResult.ok) {
    throw new Error("expected listSessionIntentsBySessionId to succeed");
  }

  assert.equal(intentsResult.data.length, 1);
  assert.equal(intentsResult.data[0].sessionId, session.id);
  assert.equal(intentsResult.data[0].intentText, "Write 300 words");
  assert.equal(intentsResult.data[0].inputMode, "voice");
});
