type AppStateStatus = "active" | "background" | "inactive" | "unknown" | "extension";
type AppStateEventName = "change" | "blur" | "focus";

export type AppStateLike = {
  addEventListener(
    eventName: AppStateEventName,
    handler: ((nextAppState: AppStateStatus) => void) | (() => void)
  ): { remove(): void };
};

type AppStateSubscription = { remove(): void };

type SessionTimerSnapshot = {
  sessionId: string;
  startedAtIso: string;
  accumulatedMs: number;
  lastCheckpointAtIso: string;
};

type LifecycleControllerOptions = {
  nowMs?: () => number;
  onPersistCheckpoint: (checkpoint: {
    accumulatedMs: number;
    lastCheckpointAtIso: string;
  }) => Promise<void>;
  onRestoreElapsed?: (elapsedMs: number) => void;
};

function clampPositive(value: number): number {
  return value < 0 ? 0 : value;
}

export function recoverElapsedMsFromCheckpoint(input: {
  accumulatedMs: number;
  lastCheckpointAtIso: string | null;
  nowMs?: number;
}): number {
  const nowMs = input.nowMs ?? Date.now();
  const checkpointIso = input.lastCheckpointAtIso;
  if (!checkpointIso) {
    return clampPositive(input.accumulatedMs);
  }

  const checkpointMs = new Date(checkpointIso).getTime();
  if (Number.isNaN(checkpointMs)) {
    return clampPositive(input.accumulatedMs);
  }

  return clampPositive(input.accumulatedMs + (nowMs - checkpointMs));
}

export function createSessionTimerLifecycleController(
  appState: AppStateLike,
  snapshot: SessionTimerSnapshot,
  options: LifecycleControllerOptions
): () => void {
  const nowMs = options.nowMs ?? (() => Date.now());
  const checkpoint = {
    accumulatedMs: snapshot.accumulatedMs,
    lastCheckpointAtIso: snapshot.lastCheckpointAtIso
  };
  let isPersistingCheckpoint = false;

  const persistCurrentCheckpoint = async (): Promise<void> => {
    if (isPersistingCheckpoint) {
      return;
    }

    isPersistingCheckpoint = true;
    const recoveredElapsedMs = recoverElapsedMsFromCheckpoint({
      accumulatedMs: checkpoint.accumulatedMs,
      lastCheckpointAtIso: checkpoint.lastCheckpointAtIso,
      nowMs: nowMs()
    });
    checkpoint.accumulatedMs = recoveredElapsedMs;
    checkpoint.lastCheckpointAtIso = new Date(nowMs()).toISOString();
    try {
      await options.onPersistCheckpoint({
        accumulatedMs: checkpoint.accumulatedMs,
        lastCheckpointAtIso: checkpoint.lastCheckpointAtIso
      });
    } finally {
      isPersistingCheckpoint = false;
    }
  };

  const restoreElapsed = (): void => {
    if (!options.onRestoreElapsed) {
      return;
    }

    const elapsedMs = recoverElapsedMsFromCheckpoint({
      accumulatedMs: checkpoint.accumulatedMs,
      lastCheckpointAtIso: checkpoint.lastCheckpointAtIso,
      nowMs: nowMs()
    });
    options.onRestoreElapsed(elapsedMs);
  };

  const safeAddEventListener = (
    eventName: AppStateEventName,
    handler: ((nextAppState: AppStateStatus) => void) | (() => void)
  ): AppStateSubscription => {
    try {
      return appState.addEventListener(eventName, handler);
    } catch {
      return { remove: () => undefined };
    }
  };

  const changeSubscription = safeAddEventListener("change", (nextState) => {
    if (nextState === "background" || nextState === "inactive") {
      void persistCurrentCheckpoint();
      return;
    }

    if (nextState === "active") {
      restoreElapsed();
    }
  });

  const blurSubscription = safeAddEventListener("blur", () => {
    void persistCurrentCheckpoint();
  });

  const focusSubscription = safeAddEventListener("focus", () => {
    restoreElapsed();
  });

  return () => {
    changeSubscription.remove();
    blurSubscription.remove();
    focusSubscription.remove();
  };
}
