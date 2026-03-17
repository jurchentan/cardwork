import assert from "node:assert/strict";
import test from "node:test";

import { SessionRepository } from "@/database/repositories/session-repository";
import { classifyAndPersistSessionIntent } from "@/features/classification/application/classify-and-persist-session-intent";

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
        accumulated_ms: Number(params.$accumulated_ms),
        last_checkpoint_at: (params.$last_checkpoint_at as string | null) ?? null,
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
      return;
    }

    if (source.includes("UPDATE session_intents")) {
      const sessionIntent = this.sessionIntents.find((row) => row.session_id === String(params.$session_id));
      if (!sessionIntent) {
        return;
      }

      sessionIntent.work_type_tag = String(params.$work_type_tag);
      sessionIntent.classifier_source = String(params.$classifier_source);
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

test("classification success persists remote tag and source", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Study system design",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const classified = await classifyAndPersistSessionIntent(
    repository,
    {
      async classifyIntent() {
        return {
          ok: true,
          data: {
            workTypeTag: "learning",
            classifierSource: "remote"
          }
        };
      }
    },
    {
      sessionId: started.data.id,
      intentText: "Study system design"
    }
  );

  assert.equal(classified.ok, true);
  if (!classified.ok) {
    throw new Error("expected classification success");
  }

  assert.equal(classified.data.requiresManualSelection, false);

  const intents = await repository.listSessionIntentsBySessionId(started.data.id);
  assert.equal(intents.ok, true);
  if (!intents.ok) {
    throw new Error("expected intent fetch to succeed");
  }

  assert.equal(intents.data[0].workTypeTag, "learning");
  assert.equal(intents.data[0].classifierSource, "remote");
});

test("classification failure keeps flow alive and allows manual persistence", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Gym session",
    inputMode: "voice"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const classified = await classifyAndPersistSessionIntent(
    repository,
    {
      async classifyIntent() {
        return {
          ok: false,
          error: {
            code: "CLASSIFIER_OFFLINE",
            message: "No network",
            retriable: true
          }
        };
      }
    },
    {
      sessionId: started.data.id,
      intentText: "Gym session"
    }
  );

  assert.equal(classified.ok, true);
  if (!classified.ok) {
    throw new Error("expected manual fallback result");
  }

  assert.equal(classified.data.requiresManualSelection, true);
  assert.equal(classified.data.classification, null);

  const manualSaved = await repository.updateIntentClassification({
    sessionId: started.data.id,
    workTypeTag: "physical",
    classifierSource: "manual"
  });
  assert.equal(manualSaved.ok, true);

  const intents = await repository.listSessionIntentsBySessionId(started.data.id);
  assert.equal(intents.ok, true);
  if (!intents.ok) {
    throw new Error("expected intent fetch to succeed");
  }

  assert.equal(intents.data[0].workTypeTag, "physical");
  assert.equal(intents.data[0].classifierSource, "manual");
});
