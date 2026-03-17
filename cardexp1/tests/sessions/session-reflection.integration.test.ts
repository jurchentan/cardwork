import assert from "node:assert/strict";
import test from "node:test";

import { SessionRepository } from "@/database/repositories/session-repository";
import { submitSessionReflection } from "@/features/sessions/application/submit-session-reflection";
import type { ReflectionPlausibilityProvider } from "@/features/sessions/application/reflection-plausibility-provider";

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

type SessionReflectionRow = {
  id: string;
  session_id: string;
  reflection_text: string | null;
  reflection_mode: string;
  plausibility_status: string;
  revenge_task_assigned: number;
  created_at: string;
};

class FakeSessionDatabase {
  private readonly sessions: SessionRow[] = [];
  private readonly sessionIntents: SessionIntentRow[] = [];
  private readonly sessionReflections: SessionReflectionRow[] = [];

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
      session.integrity_status = String(params.$integrity_status);
      session.updated_at = String(params.$updated_at);
      return;
    }

    if (source.includes("INSERT INTO session_reflections")) {
      this.sessionReflections.push({
        id: String(params.$id),
        session_id: String(params.$session_id),
        reflection_text: (params.$reflection_text as string | null) ?? null,
        reflection_mode: String(params.$reflection_mode),
        plausibility_status: String(params.$plausibility_status),
        revenge_task_assigned: Number(params.$revenge_task_assigned),
        created_at: String(params.$created_at)
      });
      return;
    }

    if (source.includes("UPDATE session_reflections")) {
      const sessionId = String(params.$session_id);
      const existing = this.sessionReflections
        .filter((row) => row.session_id === sessionId)
        .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];

      if (!existing) {
        return;
      }

      existing.reflection_text = (params.$reflection_text as string | null) ?? null;
      existing.reflection_mode = String(params.$reflection_mode);
      existing.plausibility_status = String(params.$plausibility_status);
      existing.revenge_task_assigned = Number(params.$revenge_task_assigned);
    }
  }

  async getAllAsync<T>(source: string, params?: Record<string, unknown>): Promise<T[]> {
    if (source.includes("FROM sessions") && params?.$id) {
      return this.sessions.filter((row) => row.id === params.$id) as T[];
    }

    if (source.includes("FROM session_reflections") && params?.$session_id) {
      return this.sessionReflections.filter((row) => row.session_id === params.$session_id) as T[];
    }

    return [];
  }
}

test("submitSessionReflection persists plausible outcome for eligible session", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Ship review fixes",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const gateReady = await repository.updateIntegrityForRewardAttempt({
    sessionId: started.data.id,
    accumulatedMs: 30 * 60 * 1000,
    lastCheckpointAt: new Date().toISOString(),
    integrityStatus: "ready_for_reward"
  });
  assert.equal(gateReady.ok, true);

  const submitted = await submitSessionReflection(repository, {
    sessionId: started.data.id,
    reflectionText: "I completed one feature flow, fixed regression tests, and documented the implementation risks in the story file.",
    reflectionMode: "text"
  });

  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("expected reflection submission success");
  }

  assert.equal(submitted.data.plausibilityStatus, "plausible");
  assert.equal(submitted.data.rewardEligible, true);

  const reflections = await repository.listSessionReflectionsBySessionId(started.data.id);
  assert.equal(reflections.ok, true);
  if (!reflections.ok) {
    throw new Error("expected reflection list success");
  }

  assert.equal(reflections.data.length, 1);
  assert.equal(reflections.data[0].plausibilityStatus, "plausible");
  assert.equal(reflections.data[0].revengeTaskAssigned, false);
});

test("submitSessionReflection blocks reward for too-short reflection", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Gym",
    inputMode: "voice"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const gateReady = await repository.updateIntegrityForRewardAttempt({
    sessionId: started.data.id,
    accumulatedMs: 30 * 60 * 1000,
    lastCheckpointAt: new Date().toISOString(),
    integrityStatus: "ready_for_reward"
  });
  assert.equal(gateReady.ok, true);

  const submitted = await submitSessionReflection(repository, {
    sessionId: started.data.id,
    reflectionText: "done",
    reflectionMode: "voice"
  });

  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("expected reflection submission result");
  }

  assert.equal(submitted.data.plausibilityStatus, "implausible");
  assert.equal(submitted.data.rewardEligible, false);
  assert.equal(submitted.data.revengeTaskAssigned, true);

  const reflections = await repository.listSessionReflectionsBySessionId(started.data.id);
  assert.equal(reflections.ok, true);
  if (!reflections.ok) {
    throw new Error("expected reflection list success");
  }

  assert.equal(reflections.data[0].plausibilityStatus, "implausible");
  assert.equal(reflections.data[0].revengeTaskAssigned, true);
});

test("submitSessionReflection requires integrity gate eligibility first", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Write",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const submitted = await submitSessionReflection(repository, {
    sessionId: started.data.id,
    reflectionText: "I wrote code and validated tests across the flow.",
    reflectionMode: "text"
  });

  assert.equal(submitted.ok, false);
  if (!submitted.ok) {
    assert.equal(submitted.error.code, "SESSION_NOT_READY_FOR_REFLECTION");
  }
});

test("submitSessionReflection falls back to deterministic local plausibility on retriable provider errors", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Plan tomorrow",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  await repository.updateIntegrityForRewardAttempt({
    sessionId: started.data.id,
    accumulatedMs: 30 * 60 * 1000,
    lastCheckpointAt: new Date().toISOString(),
    integrityStatus: "ready_for_reward"
  });

  const flakyProvider: ReflectionPlausibilityProvider = {
    async evaluateReflection() {
      return {
        ok: false,
        error: {
          code: "REFLECTION_PROVIDER_TIMEOUT",
          message: "Provider timed out",
          retriable: true
        }
      };
    }
  };

  const submitted = await submitSessionReflection(
    repository,
    {
      sessionId: started.data.id,
      reflectionText:
        "I completed one module, wrote deterministic tests for edge cases, and documented migration notes for the team.",
      reflectionMode: "text"
    },
    {
      plausibilityProvider: flakyProvider
    }
  );

  assert.equal(submitted.ok, true);
  if (!submitted.ok) {
    throw new Error("expected reflection submission success");
  }

  assert.equal(submitted.data.plausibilityStatus, "plausible");
  assert.equal(submitted.data.rewardEligible, true);
  assert.equal(submitted.data.reasonCode, "REFLECTION_FALLBACK_LOCAL_RULES");
});

test("submitSessionReflection returns provider failure for non-retriable plausibility errors", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Review logs",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  await repository.updateIntegrityForRewardAttempt({
    sessionId: started.data.id,
    accumulatedMs: 30 * 60 * 1000,
    lastCheckpointAt: new Date().toISOString(),
    integrityStatus: "ready_for_reward"
  });

  const failedProvider: ReflectionPlausibilityProvider = {
    async evaluateReflection() {
      return {
        ok: false,
        error: {
          code: "REFLECTION_PROVIDER_FAILURE",
          message: "Provider rejected payload",
          retriable: false
        }
      };
    }
  };

  const submitted = await submitSessionReflection(
    repository,
    {
      sessionId: started.data.id,
      reflectionText: "I reviewed the flow and logged one bug fix.",
      reflectionMode: "text"
    },
    {
      plausibilityProvider: failedProvider
    }
  );

  assert.equal(submitted.ok, false);
  if (!submitted.ok) {
    assert.equal(submitted.error.code, "REFLECTION_PROVIDER_FAILURE");
    assert.equal(submitted.error.retriable, false);
  }
});

test("updateSessionReflection updates the latest stored reflection for a session", async () => {
  const db = new FakeSessionDatabase();
  const repository = new SessionRepository(db);

  const started = await repository.startSession({
    intentText: "Refine story",
    inputMode: "text"
  });
  assert.equal(started.ok, true);
  if (!started.ok) {
    throw new Error("expected started session");
  }

  const created = await repository.createSessionReflection({
    sessionId: started.data.id,
    reflectionText: "I did initial draft.",
    reflectionMode: "text",
    plausibilityStatus: "implausible",
    revengeTaskAssigned: true
  });
  assert.equal(created.ok, true);

  const updated = await repository.updateSessionReflection({
    sessionId: started.data.id,
    reflectionText: "I completed the final implementation, validated all tests, and documented follow-up review notes.",
    reflectionMode: "voice",
    plausibilityStatus: "plausible",
    revengeTaskAssigned: false
  });
  assert.equal(updated.ok, true);

  const reflections = await repository.listSessionReflectionsBySessionId(started.data.id);
  assert.equal(reflections.ok, true);
  if (!reflections.ok) {
    throw new Error("expected reflection list success");
  }

  assert.equal(reflections.data.length, 1);
  assert.equal(reflections.data[0].reflectionMode, "voice");
  assert.equal(reflections.data[0].plausibilityStatus, "plausible");
  assert.equal(reflections.data[0].revengeTaskAssigned, false);
});
