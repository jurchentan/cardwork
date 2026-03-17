import type { Result } from "@/shared/result/result";

import {
  type SessionRecord,
  type StartSessionInput,
  validateStartSessionInput
} from "@/features/sessions/domain/session-start";

export type SessionStartRepository = {
  startSession(input: StartSessionInput): Promise<Result<SessionRecord>>;
};

export async function startSession(
  repository: SessionStartRepository,
  input: StartSessionInput
): Promise<Result<SessionRecord>> {
  const validationCode = validateStartSessionInput(input);
  if (validationCode) {
    return {
      ok: false,
      error: {
        code: validationCode,
        message: "Session input is invalid",
        retriable: false
      }
    };
  }

  return repository.startSession({
    intentText: input.intentText.trim(),
    inputMode: input.inputMode
  });
}
