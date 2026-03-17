import { useEffect, useMemo, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { evaluateSessionIntegrityGate } from "@/features/sessions/domain/session-integrity";
import type { SessionRecord } from "@/features/sessions/domain/session-start";
import {
  claimSessionReward,
  classifySessionIntentWithFallback,
  loadActiveSession,
  persistManualIntentClassification,
  persistSessionReflection,
  persistSessionIntegrityCheckpoint,
  persistSessionStart
} from "@/features/sessions/infrastructure/start-session-persistence";
import {
  createSessionTimerLifecycleController,
  recoverElapsedMsFromCheckpoint
} from "@/features/sessions/infrastructure/session-timer-lifecycle";
import { buildStartSessionInput } from "@/features/sessions/ui/session-start-flow";
import type { WorkTypeTag } from "@/features/classification/domain/work-type";
import type { SessionReflectionMode } from "@/features/sessions/domain/session-reflection";

const DEBUG_MINIMUM_SESSION_DURATION_MS = 30 * 1000;

export default function SessionScreen() {
  const [intentText, setIntentText] = useState("Quick focus sprint");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isSaving, setIsSaving] = useState(false);
  const [isClassifyingSession, setIsClassifyingSession] = useState(false);
  const [isSavingManualTag, setIsSavingManualTag] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "started" | "claiming" | "error">("idle");
  const [debugFastIntegrityGateEnabled, setDebugFastIntegrityGateEnabled] = useState(false);
  const [classifiedTag, setClassifiedTag] = useState<string | null>(null);
  const [manualTagOptions, setManualTagOptions] = useState<{ tag: WorkTypeTag; label: string }[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionMode, setReflectionMode] = useState<SessionReflectionMode>("text");
  const [reflectionOutcome, setReflectionOutcome] = useState<"plausible" | "implausible" | null>(null);

  const minimumDurationMs = debugFastIntegrityGateEnabled ? DEBUG_MINIMUM_SESSION_DURATION_MS : undefined;

  const gate = useMemo(() => {
    if (!session) {
      return null;
    }

    return evaluateSessionIntegrityGate({
      startedAt: session.startedAt,
      accumulatedMs: session.accumulatedMs,
      minimumDurationMs
    });
  }, [minimumDurationMs, session]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession(): Promise<void> {
      const result = await loadActiveSession();
      if (!result.ok || cancelled || !result.data) {
        return;
      }

      setSession(result.data);
      const recoveredMs = recoverElapsedMsFromCheckpoint({
        accumulatedMs: result.data.accumulatedMs,
        lastCheckpointAtIso: result.data.lastCheckpointAt,
        nowMs: Date.now()
      });
      setElapsedSeconds(Math.floor(recoveredMs / 1000));
      setStatus("started");
      setStatusMessage("Recovered active session state.");
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = setInterval(() => {
      const recoveredMs = recoverElapsedMsFromCheckpoint({
        accumulatedMs: session.accumulatedMs,
        lastCheckpointAtIso: session.lastCheckpointAt,
        nowMs: Date.now()
      });

      setElapsedSeconds(Math.floor(recoveredMs / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const stopLifecycleController = createSessionTimerLifecycleController(
      AppState,
      {
        sessionId: session.id,
        startedAtIso: session.startedAt,
        accumulatedMs: session.accumulatedMs,
        lastCheckpointAtIso: session.lastCheckpointAt ?? session.startedAt
      },
      {
        onPersistCheckpoint: async ({ accumulatedMs, lastCheckpointAtIso }) => {
          await persistSessionIntegrityCheckpoint({
            sessionId: session.id,
            accumulatedMs,
            lastCheckpointAtIso
          });

          setSession((current) => {
            if (!current || current.id !== session.id) {
              return current;
            }

            return {
              ...current,
              accumulatedMs,
              lastCheckpointAt: lastCheckpointAtIso,
              updatedAt: lastCheckpointAtIso
            };
          });
        },
        onRestoreElapsed: (restoredElapsedMs) => {
          setElapsedSeconds(Math.floor(restoredElapsedMs / 1000));
        }
      }
    );

    return stopLifecycleController;
  }, [session]);

  async function onStartSession(): Promise<void> {
    setTapCount((value) => value + 1);
    setIsSaving(true);
    setStatus("saving");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const request = buildStartSessionInput(intentText, inputMode);
      const result = await persistSessionStart(request);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setStatus("error");
        return;
      }

      setSession(result.data);
      setElapsedSeconds(0);
      setStatus("started");
      setStatusMessage("Session timer is running.");
      setReflectionText("");
      setReflectionOutcome(null);

      setIsClassifyingSession(true);
      const classificationResult = await classifySessionIntentWithFallback({
        sessionId: result.data.id,
        intentText: request.intentText
      });

      if (!classificationResult.ok) {
        setErrorMessage(classificationResult.error.message);
        setStatus("error");
        return;
      }

      if (classificationResult.data.classification) {
        setManualTagOptions([]);
        setClassifiedTag(classificationResult.data.classification.workTypeTag);
        setStatusMessage(`Session timer is running. Tagged as ${classificationResult.data.classification.workTypeTag}.`);
        return;
      }

      setClassifiedTag(null);
      setManualTagOptions(classificationResult.data.manualOptions);
      setStatusMessage("Session timer is running. Choose a work type manually to continue.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected start failure";
      setErrorMessage(message);
      setStatus("error");
    } finally {
      setIsClassifyingSession(false);
      setIsSaving(false);
    }
  }

  async function onSelectManualTag(workTypeTag: WorkTypeTag): Promise<void> {
    if (!session) {
      return;
    }

    setIsSavingManualTag(true);
    setErrorMessage(null);

    try {
      const persisted = await persistManualIntentClassification({
        sessionId: session.id,
        workTypeTag
      });

      if (!persisted.ok) {
        setErrorMessage(persisted.error.message);
        setStatus("error");
        return;
      }

      setClassifiedTag(workTypeTag);
      setManualTagOptions([]);
      setStatusMessage(`Session timer is running. Manual tag selected: ${workTypeTag}.`);
      setStatus("started");
    } finally {
      setIsSavingManualTag(false);
    }
  }

  async function onClaimReward(): Promise<void> {
    if (!session) {
      return;
    }

    setIsClaiming(true);
    setStatus("claiming");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const result = await claimSessionReward({
        sessionId: session.id,
        correlationId: `session-reward-${Date.now()}`,
        minimumDurationMs
      });

      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.error.message);
        return;
      }

      setSession((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          accumulatedMs: result.data.elapsedMs,
          lastCheckpointAt: new Date().toISOString(),
          integrityStatus: "ready_for_reward"
        };
      });
      setStatus("started");
      setStatusMessage("Integrity gate passed. Submit your reflection to continue.");
    } finally {
      setIsClaiming(false);
    }
  }

  async function onSubmitReflection(): Promise<void> {
    if (!session) {
      return;
    }

    setIsSubmittingReflection(true);
    setErrorMessage(null);

    try {
      const result = await persistSessionReflection({
        sessionId: session.id,
        reflectionText,
        reflectionMode
      });

      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.error.message);
        return;
      }

      setReflectionOutcome(result.data.plausibilityStatus);
      if (result.data.plausibilityStatus === "plausible") {
        setStatusMessage("Reflection accepted. Reward flow is now eligible for card award.");
      } else {
        setStatusMessage("Reflection rejected: please provide a longer, specific summary. Revenge Task may be assigned.");
      }
      setStatus("started");
    } finally {
      setIsSubmittingReflection(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Session</Text>
      <Text style={styles.subtitle}>Set intent by text or voice mode, then launch timer.</Text>

      <View style={styles.modeRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setInputMode("text")}
          style={[styles.modeButton, inputMode === "text" && styles.modeButtonActive]}
        >
          <Text style={styles.modeLabel}>Text</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setInputMode("voice")}
          style={[styles.modeButton, inputMode === "voice" && styles.modeButtonActive]}
        >
          <Text style={styles.modeLabel}>Voice</Text>
        </Pressable>
      </View>

      <TextInput
        onChangeText={setIntentText}
        placeholder="Describe your session intent"
        style={styles.input}
        value={intentText}
      />
      <Text style={styles.aiNote}>
        AI note: more specific goals improve classification quality (for example, &quot;Write 400 words of the intro&quot; instead of &quot;Work&quot;).
      </Text>

      <Pressable accessibilityRole="button" disabled={isSaving} onPress={onStartSession} style={styles.startButton}>
        <Text style={styles.startButtonLabel}>{isSaving ? "Starting..." : "Start Session"}</Text>
      </Pressable>

      <View style={styles.debugBox}>
        <Text style={styles.debugText}>Button taps: {tapCount}</Text>
        <Text style={styles.debugText}>Status: {status}</Text>
        <Text style={styles.debugText}>Classifying: {isClassifyingSession ? "yes" : "no"}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setDebugFastIntegrityGateEnabled((value) => !value)}
        style={[styles.debugToggle, debugFastIntegrityGateEnabled && styles.debugToggleActive]}
      >
        <Text style={styles.debugToggleLabel}>
          Debug Gate: {debugFastIntegrityGateEnabled ? "30 seconds" : "30 minutes"}
        </Text>
      </Pressable>

      {inputMode === "voice" ? <Text style={styles.hint}>Voice uses text fallback in this story.</Text> : null}
      {manualTagOptions.length ? (
        <View style={styles.manualTagBox}>
          <Text style={styles.manualTagTitle}>Select Work Type</Text>
          <View style={styles.manualTagRow}>
            {manualTagOptions.map((option) => (
              <Pressable
                key={option.tag}
                accessibilityRole="button"
                disabled={isSavingManualTag}
                onPress={() => {
                  void onSelectManualTag(option.tag);
                }}
                style={styles.manualTagButton}
              >
                <Text style={styles.manualTagButtonLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {status === "started" && session ? (
        <View style={styles.runningBanner}>
          <Text style={styles.runningTitle}>Session Started</Text>
          <Text style={styles.runningTime}>{elapsedSeconds}s</Text>
          <Text style={styles.runningMeta}>ID: {session.id}</Text>
          <Text style={styles.runningMeta}>
            {gate?.eligible ? "Integrity Gate: Ready" : `Integrity Gate: ${Math.ceil((gate?.remainingMs ?? 0) / 1000)}s remaining`}
          </Text>
          <Text style={styles.runningMeta}>Work Type: {classifiedTag ?? "pending"}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isClaiming}
            onPress={onClaimReward}
            style={styles.claimButton}
          >
            <Text style={styles.claimButtonLabel}>{isClaiming ? "Checking..." : "End Session and Claim Reward"}</Text>
          </Pressable>
        </View>
      ) : null}
      {session?.integrityStatus === "ready_for_reward" && reflectionOutcome !== "plausible" ? (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionTitle}>Post-Session Reflection</Text>
          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReflectionMode("text")}
              style={[styles.modeButton, reflectionMode === "text" && styles.modeButtonActive]}
            >
              <Text style={styles.modeLabel}>Text</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReflectionMode("voice")}
              style={[styles.modeButton, reflectionMode === "voice" && styles.modeButtonActive]}
            >
              <Text style={styles.modeLabel}>Voice</Text>
            </Pressable>
          </View>
          <TextInput
            multiline
            onChangeText={setReflectionText}
            placeholder="What did you actually complete this session?"
            style={styles.reflectionInput}
            value={reflectionText}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isSubmittingReflection}
            onPress={() => {
              void onSubmitReflection();
            }}
            style={styles.submitReflectionButton}
          >
            <Text style={styles.submitReflectionLabel}>{isSubmittingReflection ? "Checking..." : "Submit Reflection"}</Text>
          </Pressable>
        </View>
      ) : null}
      {reflectionOutcome ? (
        <Text style={reflectionOutcome === "plausible" ? styles.success : styles.error}>
          Reflection status: {reflectionOutcome}
        </Text>
      ) : null}
      {statusMessage ? <Text style={styles.success}>{statusMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 14
  },
  modeRow: {
    flexDirection: "row",
    gap: 8
  },
  modeButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  modeButtonActive: {
    backgroundColor: "#bfdbfe"
  },
  modeLabel: {
    fontWeight: "600"
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  aiNote: {
    color: "#475569",
    fontSize: 12
  },
  startButton: {
    alignItems: "center",
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 12
  },
  startButtonLabel: {
    color: "#ffffff",
    fontWeight: "700"
  },
  hint: {
    color: "#6b7280",
    fontSize: 12
  },
  debugBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  debugText: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "600"
  },
  debugToggle: {
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10
  },
  debugToggleActive: {
    backgroundColor: "#fde68a"
  },
  debugToggleLabel: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  },
  manualTagBox: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10
  },
  manualTagTitle: {
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: "700"
  },
  manualTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  manualTagButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  manualTagButtonLabel: {
    color: "#1e40af",
    fontSize: 12,
    fontWeight: "700"
  },
  reflectionBox: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10
  },
  reflectionTitle: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700"
  },
  reflectionInput: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: "top"
  },
  submitReflectionButton: {
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingVertical: 10
  },
  submitReflectionLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  runningBanner: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
    borderRadius: 10,
    borderWidth: 2,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  runningTitle: {
    color: "#166534",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  runningTime: {
    color: "#14532d",
    fontSize: 30,
    fontWeight: "900"
  },
  runningMeta: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600"
  },
  claimButton: {
    alignItems: "center",
    backgroundColor: "#166534",
    borderRadius: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  claimButtonLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  success: {
    color: "#166534"
  },
  error: {
    color: "#b91c1c"
  }
});
