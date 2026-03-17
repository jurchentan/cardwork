import {
  evaluateReflectionPlausibility,
  validateSessionReflectionInput,
  type SessionReflectionMode
} from "@/features/sessions/domain/session-reflection";
import type { ReflectionPlausibilityProvider } from "@/features/sessions/application/reflection-plausibility-provider";
import type { SessionRecord } from "@/features/sessions/domain/session-start";
import type { Result } from "@/shared/result/result";

type ReflectionRepository = {
  getSessionForRewardClaim(sessionId: string): Promise<Result<SessionRecord>>;
  createSessionReflection(input: {
    sessionId: string;
    reflectionText: string;
    reflectionMode: SessionReflectionMode;
    plausibilityStatus: "plausible" | "implausible";
    revengeTaskAssigned: boolean;
  }): Promise<Result<void>>;
};

export async function submitSessionReflection(
  repository: ReflectionRepository,
  input: {
    sessionId: string;
    reflectionText: string;
    reflectionMode: SessionReflectionMode;
  },
  options?: {
    plausibilityProvider?: ReflectionPlausibilityProvider;
  }
): Promise<
  Result<{
    plausibilityStatus: "plausible" | "implausible";
    rewardEligible: boolean;
    revengeTaskAssigned: boolean;
    reasonCode: "REFLECTION_EMPTY" | "REFLECTION_TOO_SHORT" | "REFLECTION_FALLBACK_LOCAL_RULES" | null;
  }>
> {
  const validated = validateSessionReflectionInput({
    reflectionMode: input.reflectionMode,
    reflectionText: input.reflectionText
  });
  if (!validated.ok) {
    return validated;
  }

  const session = await repository.getSessionForRewardClaim(input.sessionId);
  if (!session.ok) {
    return session;
  }

  if (session.data.integrityStatus !== "ready_for_reward") {
    return {
      ok: false,
      error: {
        code: "SESSION_NOT_READY_FOR_REFLECTION",
        message: "Complete the session integrity gate before submitting reflection",
        retriable: true
      }
    };
  }

  let decision = evaluateReflectionPlausibility(validated.data.reflectionText);

  if (options?.plausibilityProvider) {
    const remoteDecision = await options.plausibilityProvider.evaluateReflection({
      reflectionMode: validated.data.reflectionMode,
      reflectionText: validated.data.reflectionText
    });

    if (remoteDecision.ok) {
      decision = remoteDecision.data;
    } else if (!remoteDecision.error.retriable) {
      return remoteDecision;
    } else {
      decision = {
        ...decision,
        reasonCode: "REFLECTION_FALLBACK_LOCAL_RULES"
      };
    }
  }

  const persisted = await repository.createSessionReflection({
    sessionId: input.sessionId,
    reflectionText: validated.data.reflectionText,
    reflectionMode: validated.data.reflectionMode,
    plausibilityStatus: decision.plausibilityStatus,
    revengeTaskAssigned: decision.revengeTaskAssigned
  });

  if (!persisted.ok) {
    return persisted;
  }

  return {
    ok: true,
    data: {
      plausibilityStatus: decision.plausibilityStatus,
      rewardEligible: decision.rewardEligible,
      revengeTaskAssigned: decision.revengeTaskAssigned,
      reasonCode: decision.reasonCode
    }
  };
}
