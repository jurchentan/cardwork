import assert from "node:assert/strict";
import test from "node:test";

import { SessionRepository } from "@/database/repositories/session-repository";
import {
  createSessionTimerLifecycleController,
  recoverElapsedMsFromCheckpoint
} from "@/features/sessions/infrastructure/session-timer-lifecycle";

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

    if (source.includes("UPDATE sessions")) {
      const session = this.sessions.find((row) => row.id === String(params.$id));
      if (!session) {
        return;
      }

      session.accumulated_ms = Number(params.$accumulated_ms);
      session.last_checkpoint_at = String(params.$last_checkpoint_at);
      session.updated_at = String(params.$updated_at);
      return;
    }
  }

  async getAllAsync<T>(source: string, params?: Record<string, unknown>): Promise<T[]> {
    if (source.includes("FROM sessions") && source.includes("WHERE id = $id") && params?.$id) {
      return this.sessions.filter((row) => row.id === params.$id) as T[];
    }

    if (source.includes("FROM sessions")) {
      return this.sessions as T[];
    }

    if (source.includes("FROM session_intents") && params?.$session_id) {
      return this.sessionIntents.filter((row) => row.session_id === params.$session_id) as T[];
    }

    return [];
  }
}

type AppStateStatus = "active" | "background" | "inactive";
type AppStateEventName = "change" | "blur" | "focus";
type AppStateChangeHandler = (next: AppStateStatus) => void;
type AppStatePassiveHandler = () => void;

class FakeAppState {
  private readonly changeHandlers = new Set<AppStateChangeHandler>();
  private readonly blurHandlers = new Set<AppStatePassiveHandler>();
  private readonly focusHandlers = new Set<AppStatePassiveHandler>();

  addEventListener(eventName: AppStateEventName, handler: AppStateChangeHandler | AppStatePassiveHandler): { remove(): void } {
    if (eventName === "change") {
      const typedHandler = handler as AppStateChangeHandler;
      this.changeHandlers.add(typedHandler);

      return {
        remove: () => {
          this.changeHandlers.delete(typedHandler);
        }
      };
    }

    if (eventName === "blur") {
      const typedHandler = handler as AppStatePassiveHandler;
      this.blurHandlers.add(typedHandler);

      return {
        remove: () => {
          this.blurHandlers.delete(typedHandler);
        }
      };
    }

    const typedHandler = handler as AppStatePassiveHandler;
    this.focusHandlers.add(typedHandler);

    return {
      remove: () => {
        this.focusHandlers.delete(typedHandler);
      }
    };
  }

  emit(status: AppStateStatus): void {
    for (const handler of this.changeHandlers) {
      handler(status);
    }
  }

  emitBlur(): void {
    for (const handler of this.blurHandlers) {
      handler();
    }
  }

  emitFocus(): void {
    for (const handler of this.focusHandlers) {
      handler();
    }
  }
}

test("start session stores timer checkpoint fields for recovery", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Integrity session",
    inputMode: "text"
  });

  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected startSession success");
  }

  assert.equal(started.data.accumulatedMs, 0);
  assert.equal(started.data.lastCheckpointAt, started.data.startedAt);
});

test("lifecycle controller writes checkpoint on background and recovers elapsed on foreground", async () => {
  const appState = new FakeAppState();
  const writes: Array<{ accumulatedMs: number; lastCheckpointAtIso: string }> = [];

  const stop = createSessionTimerLifecycleController(
    appState,
    {
      sessionId: "session-1",
      startedAtIso: "2026-03-17T05:00:00.000Z",
      accumulatedMs: 0,
      lastCheckpointAtIso: "2026-03-17T05:00:00.000Z"
    },
    {
      nowMs: () => new Date("2026-03-17T05:10:00.000Z").getTime(),
      onPersistCheckpoint: async (checkpoint) => {
        writes.push(checkpoint);
      },
      onRestoreElapsed: () => undefined
    }
  );

  appState.emit("background");
  await Promise.resolve();
  stop();

  assert.equal(writes.length, 1);
  assert.equal(writes[0].accumulatedMs, 10 * 60 * 1000);
  assert.equal(writes[0].lastCheckpointAtIso, "2026-03-17T05:10:00.000Z");

  const recovered = recoverElapsedMsFromCheckpoint({
    accumulatedMs: writes[0].accumulatedMs,
    lastCheckpointAtIso: writes[0].lastCheckpointAtIso,
    nowMs: new Date("2026-03-17T05:15:00.000Z").getTime()
  });

  assert.equal(recovered, 15 * 60 * 1000);
});

test("lifecycle controller checkpoints on android blur and restores on focus", async () => {
  const appState = new FakeAppState();
  const writes: Array<{ accumulatedMs: number; lastCheckpointAtIso: string }> = [];
  const restored: number[] = [];

  const stop = createSessionTimerLifecycleController(
    appState,
    {
      sessionId: "session-1",
      startedAtIso: "2026-03-17T05:00:00.000Z",
      accumulatedMs: 0,
      lastCheckpointAtIso: "2026-03-17T05:00:00.000Z"
    },
    {
      nowMs: () => new Date("2026-03-17T05:10:00.000Z").getTime(),
      onPersistCheckpoint: async (checkpoint) => {
        writes.push(checkpoint);
      },
      onRestoreElapsed: (elapsedMs) => {
        restored.push(elapsedMs);
      }
    }
  );

  appState.emitBlur();
  await Promise.resolve();
  appState.emitFocus();
  stop();

  assert.equal(writes.length, 1);
  assert.equal(restored.length, 1);
  assert.equal(restored[0], 10 * 60 * 1000);
});
