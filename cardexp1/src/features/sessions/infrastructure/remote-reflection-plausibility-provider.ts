import type { ReflectionPlausibilityProvider } from "@/features/sessions/application/reflection-plausibility-provider";
import { evaluateReflectionPlausibility } from "@/features/sessions/domain/session-reflection";

const DEFAULT_TIMEOUT_MS = 2000;

type RemoteEvaluateReflection = (input: {
  reflectionText: string;
  reflectionMode: "text" | "voice";
}) => Promise<{
  plausibilityStatus: "plausible" | "implausible";
  reasonCode: "REFLECTION_EMPTY" | "REFLECTION_TOO_SHORT" | null;
}>;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("REFLECTION_PROVIDER_TIMEOUT"));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function isTransientReflectionError(message: string): boolean {
  return /network|fetch|timeout|temporar|econn|enet|unavailable|offline/i.test(message);
}

export function createRemoteReflectionPlausibilityProvider(options?: {
  timeoutMs?: number;
  evaluateRemote?: RemoteEvaluateReflection;
  isOnline?: () => boolean;
}): ReflectionPlausibilityProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const evaluateRemote =
    options?.evaluateRemote ??
    (async (input) => {
      const local = evaluateReflectionPlausibility(input.reflectionText);
      return {
        plausibilityStatus: local.plausibilityStatus,
        reasonCode: local.reasonCode === "REFLECTION_FALLBACK_LOCAL_RULES" ? null : local.reasonCode
      };
    });

  return {
    async evaluateReflection(input) {
      try {
        if (options?.isOnline && !options.isOnline()) {
          return {
            ok: false,
            error: {
              code: "REFLECTION_PROVIDER_OFFLINE",
              message: "Network is unavailable for reflection plausibility",
              retriable: true
            }
          };
        }

        const evaluated = await withTimeout(evaluateRemote(input), timeoutMs);

        return {
          ok: true,
          data: {
            plausibilityStatus: evaluated.plausibilityStatus,
            reasonCode: evaluated.reasonCode,
            rewardEligible: evaluated.plausibilityStatus === "plausible",
            revengeTaskAssigned: evaluated.plausibilityStatus === "implausible"
          }
        };
      } catch (error) {
        const rawMessage = error instanceof Error ? error.message : "";
        const code =
          rawMessage === "REFLECTION_PROVIDER_TIMEOUT"
            ? "REFLECTION_PROVIDER_TIMEOUT"
            : isTransientReflectionError(rawMessage)
              ? "REFLECTION_PROVIDER_UNAVAILABLE"
              : "REFLECTION_PROVIDER_FAILURE";

        return {
          ok: false,
          error: {
            code,
            message:
              code === "REFLECTION_PROVIDER_TIMEOUT"
                ? "Reflection provider timed out"
                : code === "REFLECTION_PROVIDER_UNAVAILABLE"
                  ? "Reflection provider is unavailable"
                  : "Reflection provider failed",
            retriable: code !== "REFLECTION_PROVIDER_FAILURE"
          }
        };
      }
    }
  };
}
