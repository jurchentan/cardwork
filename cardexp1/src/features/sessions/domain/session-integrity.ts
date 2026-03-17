export const MINIMUM_SESSION_DURATION_MS = 30 * 60 * 1000;

export type SessionIntegrityReasonCode = "SESSION_MINIMUM_NOT_MET";

export type SessionIntegrityGate = {
  eligible: boolean;
  elapsedMs: number;
  remainingMs: number;
  reasonCode: SessionIntegrityReasonCode | null;
};

export type SessionIntegrityBlockedEvent = {
  name: "session.integrity.blocked.v1";
  payload: {
    eventId: string;
    occurredAt: string;
    correlationId: string;
    sessionId: string;
    elapsedMs: number;
    remainingMs: number;
    reasonCode: SessionIntegrityReasonCode;
  };
};

type EvaluateGateInput = {
  startedAt: string;
  accumulatedMs: number;
  nowMs?: number;
  minimumDurationMs?: number;
};

function clampPositive(value: number): number {
  return value < 0 ? 0 : value;
}

export function recoverElapsedMs(input: {
  accumulatedMs: number;
  lastCheckpointAt: string;
  nowMs?: number;
}): number {
  const nowMs = input.nowMs ?? Date.now();
  const checkpointMs = new Date(input.lastCheckpointAt).getTime();
  if (Number.isNaN(checkpointMs)) {
    return clampPositive(input.accumulatedMs);
  }

  return clampPositive(input.accumulatedMs + (nowMs - checkpointMs));
}

export function evaluateSessionIntegrityGate(input: EvaluateGateInput): SessionIntegrityGate {
  const nowMs = input.nowMs ?? Date.now();
  const startedAtMs = new Date(input.startedAt).getTime();
  const minimumDurationMs = input.minimumDurationMs ?? MINIMUM_SESSION_DURATION_MS;
  const runtimeMs = Number.isNaN(startedAtMs) ? 0 : clampPositive(nowMs - startedAtMs);
  const elapsedMs = Math.max(runtimeMs, clampPositive(input.accumulatedMs));
  const remainingMs = clampPositive(minimumDurationMs - elapsedMs);
  const eligible = remainingMs === 0;

  return {
    eligible,
    elapsedMs,
    remainingMs,
    reasonCode: eligible ? null : "SESSION_MINIMUM_NOT_MET"
  };
}

export function buildSessionIntegrityBlockedEvent(input: {
  sessionId: string;
  elapsedMs: number;
  remainingMs: number;
  reasonCode: SessionIntegrityReasonCode;
  correlationId: string;
}): SessionIntegrityBlockedEvent {
  return {
    name: "session.integrity.blocked.v1",
    payload: {
      eventId: `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      occurredAt: new Date().toISOString(),
      correlationId: input.correlationId,
      sessionId: input.sessionId,
      elapsedMs: input.elapsedMs,
      remainingMs: input.remainingMs,
      reasonCode: input.reasonCode
    }
  };
}
