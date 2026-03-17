import type { SessionRecord, StartSessionInput } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

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

  return {
    ok: true,
    data: {
      id: `web-session-${Date.now()}`,
      startedAt: nowIso,
      endedAt: null,
      durationSeconds: 0,
      integrityStatus: "running",
      createdAt: nowIso,
      updatedAt: nowIso
    }
  };
}
