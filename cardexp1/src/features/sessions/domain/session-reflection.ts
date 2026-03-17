import type { Result } from "@/shared/result/result";

export const SESSION_REFLECTION_MODES = ["text", "voice"] as const;

export type SessionReflectionMode = (typeof SESSION_REFLECTION_MODES)[number];

export const MINIMUM_REFLECTION_LENGTH = 25;

export type ReflectionPlausibilityStatus = "plausible" | "implausible";

export type ReflectionReasonCode =
  | "REFLECTION_EMPTY"
  | "REFLECTION_TOO_SHORT"
  | "REFLECTION_FALLBACK_LOCAL_RULES";

export type SessionReflectionInput = {
  reflectionMode: SessionReflectionMode;
  reflectionText: string;
};

export type ReflectionPlausibilityDecision = {
  plausibilityStatus: ReflectionPlausibilityStatus;
  reasonCode: ReflectionReasonCode | null;
  rewardEligible: boolean;
  revengeTaskAssigned: boolean;
};

export type ReflectionEvaluationResult = Result<ReflectionPlausibilityDecision>;

export type SessionReflectionRecord = {
  id: string;
  sessionId: string;
  reflectionText: string | null;
  reflectionMode: SessionReflectionMode;
  plausibilityStatus: ReflectionPlausibilityStatus;
  revengeTaskAssigned: boolean;
  createdAt: string;
};

export function isValidSessionReflectionMode(value: string): value is SessionReflectionMode {
  return SESSION_REFLECTION_MODES.includes(value as SessionReflectionMode);
}

export function validateSessionReflectionInput(input: SessionReflectionInput): Result<SessionReflectionInput> {
  if (!isValidSessionReflectionMode(input.reflectionMode)) {
    return {
      ok: false,
      error: {
        code: "REFLECTION_MODE_INVALID",
        message: "Reflection mode is invalid",
        retriable: false
      }
    };
  }

  return {
    ok: true,
    data: {
      reflectionMode: input.reflectionMode,
      reflectionText: input.reflectionText.trim()
    }
  };
}

export function evaluateReflectionPlausibility(reflectionText: string): ReflectionPlausibilityDecision {
  const trimmed = reflectionText.trim();
  if (!trimmed) {
    return {
      plausibilityStatus: "implausible",
      reasonCode: "REFLECTION_EMPTY",
      rewardEligible: false,
      revengeTaskAssigned: true
    };
  }

  if (trimmed.length < MINIMUM_REFLECTION_LENGTH) {
    return {
      plausibilityStatus: "implausible",
      reasonCode: "REFLECTION_TOO_SHORT",
      rewardEligible: false,
      revengeTaskAssigned: true
    };
  }

  return {
    plausibilityStatus: "plausible",
    reasonCode: null,
    rewardEligible: true,
    revengeTaskAssigned: false
  };
}
