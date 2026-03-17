import type { SessionRecord, StartSessionInput } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

type StoredSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  integrityStatus: "running";
  createdAt: string;
  updatedAt: string;
};

type StoredSessionIntent = {
  id: string;
  sessionId: string;
  intentText: string;
  inputMode: "text" | "voice";
  workTypeTag: string | null;
  classifierSource: string | null;
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
    classifierSource: "manual",
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
