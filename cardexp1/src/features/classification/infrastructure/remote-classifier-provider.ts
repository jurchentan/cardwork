import {
  CLASSIFIER_REMOTE_SOURCE,
  type ClassifierResult,
  type WorkTypeTag
} from "@/features/classification/domain/work-type";

const DEFAULT_TIMEOUT_MS = 2000;

export type RemoteClassifyIntent = (intentText: string) => Promise<{ workTypeTag: WorkTypeTag }>;

function classifyIntentByKeyword(intentText: string): WorkTypeTag {
  const normalized = intentText.toLowerCase();

  if (/(workout|gym|run|walk|exercise|train|lift)/.test(normalized)) {
    return "physical";
  }

  if (/(study|learn|course|practice|read|lecture|tutorial)/.test(normalized)) {
    return "learning";
  }

  if (/(rest|sleep|recover|break|stretch|meditat|nap)/.test(normalized)) {
    return "recovery";
  }

  return "deep_focus";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("CLASSIFIER_TIMEOUT"));
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

function isTransientClassifierError(message: string): boolean {
  return /network|fetch|timeout|temporar|econn|enet|unavailable/i.test(message);
}

export function createRemoteClassifierProvider(options?: {
  timeoutMs?: number;
  classifyIntentRemote?: RemoteClassifyIntent;
  isOnline?: () => boolean;
}): {
  classifyIntent(intentText: string): Promise<ClassifierResult>;
} {
  const classifyIntentRemote = options?.classifyIntentRemote ?? (async (intentText: string) => ({ workTypeTag: classifyIntentByKeyword(intentText) }));
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async classifyIntent(intentText: string): Promise<ClassifierResult> {
      try {
        if (options?.isOnline && !options.isOnline()) {
          return {
            ok: false,
            error: {
              code: "CLASSIFIER_OFFLINE",
              message: "Network is unavailable for remote classification",
              retriable: true
            }
          };
        }

        const classified = await withTimeout(classifyIntentRemote(intentText), timeoutMs);

        return {
          ok: true,
          data: {
            workTypeTag: classified.workTypeTag,
            classifierSource: CLASSIFIER_REMOTE_SOURCE
          }
        };
      } catch (error) {
        const rawMessage = error instanceof Error ? error.message : "";

        const code =
          rawMessage === "CLASSIFIER_TIMEOUT"
            ? "CLASSIFIER_TIMEOUT"
            : isTransientClassifierError(rawMessage)
              ? "CLASSIFIER_UNAVAILABLE"
              : "CLASSIFIER_FAILURE";
        const message =
          code === "CLASSIFIER_TIMEOUT"
            ? "Classifier timed out"
            : code === "CLASSIFIER_UNAVAILABLE"
              ? "Remote classification service is unavailable"
              : "Remote classification failed";
        const retriable = code === "CLASSIFIER_TIMEOUT" || code === "CLASSIFIER_UNAVAILABLE";

        return {
          ok: false,
          error: {
            code,
            message,
            retriable
          }
        };
      }
    }
  };
}
