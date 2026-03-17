import { initializeDatabase } from "@/database/client";
import { SessionRepository } from "@/database/repositories/session-repository";
import { attemptSessionRewardClaim } from "@/features/sessions/application/attempt-session-reward";
import { startSession } from "@/features/sessions/application/start-session";
import type { SessionRecord, StartSessionInput } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

export async function persistSessionStart(input: StartSessionInput): Promise<Result<SessionRecord>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  return startSession(repository, input);
}

export async function persistSessionIntegrityCheckpoint(input: {
  sessionId: string;
  accumulatedMs: number;
  lastCheckpointAtIso: string;
}): Promise<Result<void>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  return repository.saveIntegrityCheckpoint({
    sessionId: input.sessionId,
    accumulatedMs: input.accumulatedMs,
    lastCheckpointAt: input.lastCheckpointAtIso
  });
}

export async function claimSessionReward(input: {
  sessionId: string;
  nowMs?: number;
  correlationId: string;
  minimumDurationMs?: number;
}): Promise<Result<{ elapsedMs: number; remainingMs: number }>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);

  return attemptSessionRewardClaim(
    repository,
    input,
    async () => ({ ok: true, data: undefined }),
    {
      onIntegrityBlockedEvent: (event) => {
        console.info("session.integrity.blocked", {
          feature: "sessions",
          operation: "claimSessionReward",
          correlationId: input.correlationId,
          errorCode: event.payload.reasonCode,
          event
        });
      }
    }
  );
}

export async function loadActiveSession(): Promise<Result<SessionRecord | null>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  return repository.getLatestRunningSession();
}
