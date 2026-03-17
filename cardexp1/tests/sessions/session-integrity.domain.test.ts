import assert from "node:assert/strict";
import test from "node:test";

import {
  MINIMUM_SESSION_DURATION_MS,
  buildSessionIntegrityBlockedEvent,
  evaluateSessionIntegrityGate
} from "@/features/sessions/domain/session-integrity";
import { attemptSessionRewardClaim } from "@/features/sessions/application/attempt-session-reward";

test("session integrity gate blocks reward at 29m59s", () => {
  const startedAt = new Date("2026-03-17T04:00:00.000Z").toISOString();
  const gate = evaluateSessionIntegrityGate({
    startedAt,
    accumulatedMs: 0,
    nowMs: new Date("2026-03-17T04:29:59.000Z").getTime()
  });

  assert.equal(gate.eligible, false);
  assert.equal(gate.reasonCode, "SESSION_MINIMUM_NOT_MET");
  assert.equal(gate.remainingMs, 1000);
  assert.equal(gate.elapsedMs, MINIMUM_SESSION_DURATION_MS - 1000);
});

test("session integrity gate allows reward at exactly 30m", () => {
  const startedAt = new Date("2026-03-17T04:00:00.000Z").toISOString();
  const gate = evaluateSessionIntegrityGate({
    startedAt,
    accumulatedMs: 0,
    nowMs: new Date("2026-03-17T04:30:00.000Z").getTime()
  });

  assert.equal(gate.eligible, true);
  assert.equal(gate.reasonCode, null);
  assert.equal(gate.remainingMs, 0);
  assert.equal(gate.elapsedMs, MINIMUM_SESSION_DURATION_MS);
});

test("blocked completion emits versioned integrity event", () => {
  const event = buildSessionIntegrityBlockedEvent({
    sessionId: "session-123",
    elapsedMs: 1000,
    remainingMs: MINIMUM_SESSION_DURATION_MS - 1000,
    reasonCode: "SESSION_MINIMUM_NOT_MET",
    correlationId: "corr-1"
  });

  assert.equal(event.name, "session.integrity.blocked.v1");
  assert.equal(event.payload.sessionId, "session-123");
  assert.equal(event.payload.reasonCode, "SESSION_MINIMUM_NOT_MET");
});

test("attemptSessionRewardClaim returns typed ineligible error and skips reward flow", async () => {
  let rewardCallCount = 0;
  let emittedCode: string | null = null;

  const result = await attemptSessionRewardClaim(
    {
      async getSessionForRewardClaim() {
        return {
          ok: true,
          data: {
            id: "session-1",
            startedAt: new Date("2026-03-17T04:00:00.000Z").toISOString(),
            endedAt: null,
            durationSeconds: 0,
            accumulatedMs: 0,
            lastCheckpointAt: new Date("2026-03-17T04:00:00.000Z").toISOString(),
            integrityStatus: "running",
            createdAt: new Date("2026-03-17T04:00:00.000Z").toISOString(),
            updatedAt: new Date("2026-03-17T04:00:00.000Z").toISOString()
          }
        };
      },
      async updateIntegrityForRewardAttempt() {
        return { ok: true, data: undefined };
      }
    },
    {
      sessionId: "session-1",
      nowMs: new Date("2026-03-17T04:05:00.000Z").getTime(),
      correlationId: "corr-2"
    },
    async () => {
      rewardCallCount += 1;
      return { ok: true, data: undefined };
    },
    {
      onIntegrityBlockedEvent: (event) => {
        emittedCode = event.payload.reasonCode;
      }
    }
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "SESSION_MINIMUM_NOT_MET");
  }
  assert.equal(rewardCallCount, 0);
  assert.equal(emittedCode, "SESSION_MINIMUM_NOT_MET");
});
