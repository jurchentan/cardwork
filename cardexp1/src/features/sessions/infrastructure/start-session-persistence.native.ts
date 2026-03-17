import { initializeDatabase } from "@/database/client";
import { CardRepository } from "@/database/repositories/card-repository";
import { DeckRepository } from "@/database/repositories/deck-repository";
import { SessionRepository } from "@/database/repositories/session-repository";
import { resolveSessionReward } from "@/features/cards/application/resolve-session-reward";
import { classifyAndPersistSessionIntent } from "@/features/classification/application/classify-and-persist-session-intent";
import { createRemoteClassifierProvider } from "@/features/classification/infrastructure/remote-classifier-provider";
import type { WorkTypeTag } from "@/features/classification/domain/work-type";
import { attemptSessionRewardClaim } from "@/features/sessions/application/attempt-session-reward";
import { submitSessionReflection } from "@/features/sessions/application/submit-session-reflection";
import type { SessionReflectionMode } from "@/features/sessions/domain/session-reflection";
import { createRemoteReflectionPlausibilityProvider } from "@/features/sessions/infrastructure/remote-reflection-plausibility-provider";
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
  reflectionPlausible?: boolean;
}): Promise<
  Result<{
    elapsedMs: number;
    remainingMs: number;
    reward: {
      cardId: string;
      cardName: string;
      cardTypeTag: "focus" | "body" | "mind" | "rest";
      revealDurationMs: number;
      earnedAt: string;
    };
  }>
> {
  const db = await initializeDatabase();
  const sessionRepository = new SessionRepository(db);
  const cardRepository = new CardRepository(db);
  const deckRepository = new DeckRepository(db);

  return attemptSessionRewardClaim(
    sessionRepository,
    input,
    async () => {
      const session = await sessionRepository.getSessionForRewardClaim(input.sessionId);
      if (!session.ok) {
        return session;
      }

      const classification = await sessionRepository.getLatestIntentClassification(input.sessionId);
      if (!classification.ok) {
        return classification;
      }

      const reflectionPlausibleResult =
        typeof input.reflectionPlausible === "boolean"
          ? ({ ok: true, data: input.reflectionPlausible } as const)
          : await sessionRepository.hasPlausibleReflection(input.sessionId);

      if (!reflectionPlausibleResult.ok) {
        return reflectionPlausibleResult;
      }

      const nowIso = new Date(input.nowMs ?? Date.now()).toISOString();
      const resolution = resolveSessionReward({
        sessionId: input.sessionId,
        sessionEndedAt: session.data.endedAt,
        elapsedMs: Math.max(session.data.accumulatedMs, 0),
        workTypeTag: classification.data.workTypeTag,
        reflectionPlausible: reflectionPlausibleResult.data,
        nowIso
      });

      if (!resolution.ok) {
        return resolution;
      }

      try {
        await db.withTransactionAsync(async () => {
          const cardInsert = await cardRepository.createCard(resolution.data.card);
          if (!cardInsert.ok) {
            throw new Error(cardInsert.error.code);
          }

          const weeklyDeckInsert = await deckRepository.addCardToWeeklyDeck({
            id: `weekly-deck-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            weekStartDate: resolution.data.weekStartDate,
            cardId: resolution.data.card.id,
            sourceType: "session_reward",
            earnedAt: resolution.data.earnedAt
          });
          if (!weeklyDeckInsert.ok) {
            throw new Error(weeklyDeckInsert.error.code);
          }

          const sessionFinalize = await sessionRepository.finalizeSessionReward({
            sessionId: input.sessionId,
            endedAt: resolution.data.earnedAt,
            durationSeconds: resolution.data.durationSeconds,
            integrityStatus: "ready_for_reward"
          });
          if (!sessionFinalize.ok) {
            throw new Error(sessionFinalize.error.code);
          }
        });
      } catch {
        return {
          ok: false,
          error: {
            code: "REWARD_PERSISTENCE_FAILED",
            message: "Unable to persist reward outcome.",
            retriable: true
          }
        };
      }

      return {
        ok: true,
        data: {
          cardId: resolution.data.card.id,
          cardName: resolution.data.card.cardName,
          cardTypeTag: resolution.data.card.cardTypeTag,
          revealDurationMs: 1200,
          earnedAt: resolution.data.earnedAt
        }
      };
    },
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

export async function classifySessionIntentWithFallback(input: {
  sessionId: string;
  intentText: string;
}): Promise<
  Result<{
    classification: { workTypeTag: WorkTypeTag; classifierSource: "remote" } | null;
    requiresManualSelection: boolean;
    manualOptions: { tag: WorkTypeTag; label: string }[];
    failure?: {
      code: string;
      message: string;
      retriable: boolean;
    };
  }>
> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  const classifier = createRemoteClassifierProvider();

  return classifyAndPersistSessionIntent(repository, classifier, input);
}

export async function persistManualIntentClassification(input: {
  sessionId: string;
  workTypeTag: WorkTypeTag;
}): Promise<Result<void>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);

  return repository.updateIntentClassification({
    sessionId: input.sessionId,
    workTypeTag: input.workTypeTag,
    classifierSource: "manual"
  });
}

export async function loadActiveSession(): Promise<Result<SessionRecord | null>> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  return repository.getLatestRunningSession();
}

export async function persistSessionReflection(input: {
  sessionId: string;
  reflectionText: string;
  reflectionMode: SessionReflectionMode;
}): Promise<
  Result<{
    plausibilityStatus: "plausible" | "implausible";
    rewardEligible: boolean;
    revengeTaskAssigned: boolean;
    reasonCode: "REFLECTION_EMPTY" | "REFLECTION_TOO_SHORT" | "REFLECTION_FALLBACK_LOCAL_RULES" | null;
  }>
> {
  const db = await initializeDatabase();
  const repository = new SessionRepository(db);
  const plausibilityProvider = createRemoteReflectionPlausibilityProvider();

  return submitSessionReflection(repository, input, {
    plausibilityProvider
  });
}
