import type { SessionRecord, StartSessionInput } from "@/features/sessions/domain/session-start";
import { classifyAndPersistSessionIntent } from "@/features/classification/application/classify-and-persist-session-intent";
import { createRemoteClassifierProvider } from "@/features/classification/infrastructure/remote-classifier-provider";
import type { ClassifierSource, WorkTypeTag } from "@/features/classification/domain/work-type";
import { attemptSessionRewardClaim } from "@/features/sessions/application/attempt-session-reward";
import type { Result } from "@/shared/result/result";

type StoredSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  accumulatedMs: number;
  lastCheckpointAt: string | null;
  integrityStatus: "running" | "blocked" | "ready_for_reward";
  createdAt: string;
  updatedAt: string;
};

type StoredSessionIntent = {
  id: string;
  sessionId: string;
  intentText: string;
  inputMode: "text" | "voice";
  workTypeTag: WorkTypeTag | null;
  classifierSource: ClassifierSource | null;
  createdAt: string;
};

const WEB_SESSIONS_KEY = "cardwork:web:sessions";
const WEB_SESSION_INTENTS_KEY = "cardwork:web:session-intents";

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeStoredArray<T>(key: string, rows: T[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(rows));
}

export async function persistSessionStart(input: StartSessionInput): Promise<Result<SessionRecord>> {
  const nowIso = new Date().toISOString();

  if (!input.intentText.trim()) {
    return {
      ok: false,
      error: {
        code: "INTENT_TEXT_REQUIRED",
        message: "Session input is invalid",
        retriable: false
      }
    };
  }

  const session: StoredSession = {
    id: `web-session-${Date.now()}`,
    startedAt: nowIso,
    endedAt: null,
    durationSeconds: 0,
    accumulatedMs: 0,
    lastCheckpointAt: nowIso,
    integrityStatus: "running",
    createdAt: nowIso,
    updatedAt: nowIso
  };

  const sessionIntent: StoredSessionIntent = {
    id: `web-intent-${Date.now()}`,
    sessionId: session.id,
    intentText: input.intentText.trim(),
    inputMode: input.inputMode,
    workTypeTag: null,
    classifierSource: null,
    createdAt: nowIso
  };

  const sessions = readStoredArray<StoredSession>(WEB_SESSIONS_KEY);
  sessions.push(session);
  writeStoredArray(WEB_SESSIONS_KEY, sessions);

  const sessionIntents = readStoredArray<StoredSessionIntent>(WEB_SESSION_INTENTS_KEY);
  sessionIntents.push(sessionIntent);
  writeStoredArray(WEB_SESSION_INTENTS_KEY, sessionIntents);

  return {
    ok: true,
    data: session
  };
}

function updateStoredSession(
  sessionId: string,
  updater: (session: StoredSession) => StoredSession
): Result<StoredSession> {
  const sessions = readStoredArray<StoredSession>(WEB_SESSIONS_KEY);
  const index = sessions.findIndex((session) => session.id === sessionId);

  if (index < 0) {
    return {
      ok: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Session record was not found",
        retriable: false
      }
    };
  }

  const updatedSession = updater(sessions[index]);
  sessions[index] = updatedSession;
  writeStoredArray(WEB_SESSIONS_KEY, sessions);

  return {
    ok: true,
    data: updatedSession
  };
}

export async function persistSessionIntegrityCheckpoint(input: {
  sessionId: string;
  accumulatedMs: number;
  lastCheckpointAtIso: string;
}): Promise<Result<void>> {
  const updated = updateStoredSession(input.sessionId, (session) => ({
    ...session,
    accumulatedMs: input.accumulatedMs,
    lastCheckpointAt: input.lastCheckpointAtIso,
    updatedAt: input.lastCheckpointAtIso
  }));

  if (!updated.ok) {
    return updated;
  }

  return { ok: true, data: undefined };
}

export async function claimSessionReward(input: {
  sessionId: string;
  nowMs?: number;
  correlationId: string;
  minimumDurationMs?: number;
}): Promise<Result<{ elapsedMs: number; remainingMs: number }>> {
  const repository = {
    async getSessionForRewardClaim(sessionId: string): Promise<Result<SessionRecord>> {
      const sessions = readStoredArray<StoredSession>(WEB_SESSIONS_KEY);
      const session = sessions.find((row) => row.id === sessionId);
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
        data: session
      };
    },
    async updateIntegrityForRewardAttempt(params: {
      sessionId: string;
      accumulatedMs: number;
      lastCheckpointAt: string;
      integrityStatus: "blocked" | "ready_for_reward";
    }): Promise<Result<void>> {
      const updated = updateStoredSession(params.sessionId, (session) => ({
        ...session,
        accumulatedMs: params.accumulatedMs,
        lastCheckpointAt: params.lastCheckpointAt,
        integrityStatus: params.integrityStatus,
        updatedAt: params.lastCheckpointAt
      }));

      if (!updated.ok) {
        return updated;
      }

      return { ok: true, data: undefined };
    }
  };

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

function updateStoredSessionIntent(
  sessionId: string,
  updater: (intent: StoredSessionIntent) => StoredSessionIntent
): Result<StoredSessionIntent> {
  const intents = readStoredArray<StoredSessionIntent>(WEB_SESSION_INTENTS_KEY);
  const intentIndex = [...intents]
    .map((intent, index) => ({ intent, index }))
    .filter((entry) => entry.intent.sessionId === sessionId)
    .sort((left, right) => right.intent.createdAt.localeCompare(left.intent.createdAt))[0]?.index;

  if (intentIndex === undefined) {
    return {
      ok: false,
      error: {
        code: "SESSION_INTENT_NOT_FOUND",
        message: "Session intent was not found",
        retriable: false
      }
    };
  }

  const updated = updater(intents[intentIndex]);
  intents[intentIndex] = updated;
  writeStoredArray(WEB_SESSION_INTENTS_KEY, intents);

  return {
    ok: true,
    data: updated
  };
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
  const classifier = createRemoteClassifierProvider({
    isOnline: () => (typeof navigator !== "undefined" ? navigator.onLine : true)
  });

  return classifyAndPersistSessionIntent(
    {
      async updateIntentClassification(classificationInput) {
        const updated = updateStoredSessionIntent(classificationInput.sessionId, (intent) => ({
          ...intent,
          workTypeTag: classificationInput.workTypeTag,
          classifierSource: classificationInput.classifierSource
        }));

        if (!updated.ok) {
          return updated;
        }

        return { ok: true, data: undefined };
      }
    },
    classifier,
    {
      sessionId: input.sessionId,
      intentText: input.intentText
    }
  );
}

export async function persistManualIntentClassification(input: {
  sessionId: string;
  workTypeTag: WorkTypeTag;
}): Promise<Result<void>> {
  const updated = updateStoredSessionIntent(input.sessionId, (intent) => ({
    ...intent,
    workTypeTag: input.workTypeTag,
    classifierSource: "manual"
  }));

  if (!updated.ok) {
    return updated;
  }

  return { ok: true, data: undefined };
}

export async function loadActiveSession(): Promise<Result<SessionRecord | null>> {
  const sessions = readStoredArray<StoredSession>(WEB_SESSIONS_KEY);
  const sorted = [...sessions].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const latest = sorted.find((session) => session.endedAt === null) ?? null;

  return {
    ok: true,
    data: latest
  };
}
