export const SESSION_INTENT_MODES = ["text", "voice"] as const;

export type SessionIntentMode = (typeof SESSION_INTENT_MODES)[number];

export type StartSessionInput = {
  intentText: string;
  inputMode: SessionIntentMode;
};

export type SessionRecord = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  integrityStatus: "running";
  createdAt: string;
  updatedAt: string;
};

export type SessionIntentRecord = {
  id: string;
  sessionId: string;
  intentText: string;
  inputMode: SessionIntentMode;
  workTypeTag: string | null;
  classifierSource: string | null;
  createdAt: string;
};

export function isValidSessionIntentMode(value: string): value is SessionIntentMode {
  return SESSION_INTENT_MODES.includes(value as SessionIntentMode);
}

export function validateStartSessionInput(input: StartSessionInput): string | null {
  if (!isValidSessionIntentMode(input.inputMode)) {
    return "INTENT_MODE_INVALID";
  }

  if (!input.intentText.trim()) {
    return "INTENT_TEXT_REQUIRED";
  }

  return null;
}
