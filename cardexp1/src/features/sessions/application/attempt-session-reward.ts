import {
  buildSessionIntegrityBlockedEvent,
  evaluateSessionIntegrityGate
} from "@/features/sessions/domain/session-integrity";
import type { SessionRecord } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

export type SessionRewardRepository = {
  getSessionForRewardClaim(sessionId: string): Promise<Result<SessionRecord>>;
  updateIntegrityForRewardAttempt(params: {
    sessionId: string;
    accumulatedMs: number;
    lastCheckpointAt: string;
    integrityStatus: "blocked" | "ready_for_reward";
  }): Promise<Result<void>>;
};

export type AttemptSessionRewardHooks = {
  onIntegrityBlockedEvent?: (event: ReturnType<typeof buildSessionIntegrityBlockedEvent>) => void;
};

export type AttemptSessionRewardInput = {
  sessionId: string;
  nowMs?: number;
  correlationId: string;
  minimumDurationMs?: number;
};

export type SessionRewardClaimResult<TReward> = {
  elapsedMs: number;
  remainingMs: number;
  reward: TReward;
};

export async function attemptSessionRewardClaim<TReward>(
  repository: SessionRewardRepository,
  input: AttemptSessionRewardInput,
  rewardFlow: () => Promise<Result<TReward>>,
  hooks?: AttemptSessionRewardHooks
): Promise<Result<SessionRewardClaimResult<TReward>>> {
  const sessionResult = await repository.getSessionForRewardClaim(input.sessionId);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  if (sessionResult.data.endedAt) {
    return {
      ok: false,
      error: {
        code: "REWARD_ALREADY_RESOLVED",
        message: "This session reward was already resolved.",
        retriable: false
      }
    };
  }

  const nowMs = input.nowMs ?? Date.now();
  const checkpointIso = new Date(nowMs).toISOString();
  const gate = evaluateSessionIntegrityGate({
    startedAt: sessionResult.data.startedAt,
    accumulatedMs: sessionResult.data.accumulatedMs,
    nowMs,
    minimumDurationMs: input.minimumDurationMs
  });

  if (!gate.eligible && gate.reasonCode) {
    const blockedResult = await repository.updateIntegrityForRewardAttempt({
      sessionId: input.sessionId,
      accumulatedMs: gate.elapsedMs,
      lastCheckpointAt: checkpointIso,
      integrityStatus: "blocked"
    });

    if (!blockedResult.ok) {
      return blockedResult;
    }

    const blockedEvent = buildSessionIntegrityBlockedEvent({
      sessionId: input.sessionId,
      elapsedMs: gate.elapsedMs,
      remainingMs: gate.remainingMs,
      reasonCode: gate.reasonCode,
      correlationId: input.correlationId
    });
    hooks?.onIntegrityBlockedEvent?.(blockedEvent);

    return {
      ok: false,
      error: {
        code: gate.reasonCode,
        message: `Keep the session running for ${Math.ceil(gate.remainingMs / 1000)} more seconds.`,
        retriable: true
      }
    };
  }

  const readyResult = await repository.updateIntegrityForRewardAttempt({
    sessionId: input.sessionId,
    accumulatedMs: gate.elapsedMs,
    lastCheckpointAt: checkpointIso,
    integrityStatus: "ready_for_reward"
  });

  if (!readyResult.ok) {
    return readyResult;
  }

  const rewardResult = await rewardFlow();
  if (!rewardResult.ok) {
    return rewardResult;
  }

  return {
    ok: true,
    data: {
      elapsedMs: gate.elapsedMs,
      remainingMs: 0,
      reward: rewardResult.data
    }
  };
}
