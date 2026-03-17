import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { persistSessionStart } from "@/features/sessions/infrastructure/start-session-persistence";
import { buildStartSessionInput } from "@/features/sessions/ui/session-start-flow";

export default function SessionScreen() {
  const [intentText, setIntentText] = useState("Quick focus sprint");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isSaving, setIsSaving] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "started" | "error">("idle");

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    setElapsedSeconds(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  async function onStartSession(): Promise<void> {
    setTapCount((value) => value + 1);
    setIsSaving(true);
    setStatus("saving");
    setErrorMessage(null);

    try {
      const request = buildStartSessionInput(intentText, inputMode);
      const result = await persistSessionStart(request);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setStatus("error");
        return;
      }

      setStartedAt(result.data.startedAt);
      setSessionId(result.data.id);
      setStatus("started");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected start failure";
      setErrorMessage(message);
      setStatus("error");
    } finally {
      setIsSaving(false);
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

      <Pressable accessibilityRole="button" disabled={isSaving} onPress={onStartSession} style={styles.startButton}>
        <Text style={styles.startButtonLabel}>{isSaving ? "Starting..." : "Start Session"}</Text>
      </Pressable>

      <View style={styles.debugBox}>
        <Text style={styles.debugText}>Button taps: {tapCount}</Text>
        <Text style={styles.debugText}>Status: {status}</Text>
      </View>

      {inputMode === "voice" ? <Text style={styles.hint}>Voice uses text fallback in this story.</Text> : null}
      {status === "started" && startedAt ? (
        <View style={styles.runningBanner}>
          <Text style={styles.runningTitle}>Session Started</Text>
          <Text style={styles.runningTime}>{elapsedSeconds}s</Text>
          <Text style={styles.runningMeta}>ID: {sessionId}</Text>
        </View>
      ) : null}
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
  error: {
    color: "#b91c1c"
  }
});
