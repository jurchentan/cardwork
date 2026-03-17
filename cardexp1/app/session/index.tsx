import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { persistSessionStart } from "@/features/sessions/infrastructure/start-session-persistence";
import { buildStartSessionInput } from "@/features/sessions/ui/session-start-flow";

export default function SessionScreen() {
  const [intentText, setIntentText] = useState("Quick focus sprint");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isSaving, setIsSaving] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setIsSaving(true);
    setErrorMessage(null);

    const request = buildStartSessionInput(intentText, inputMode);
    const result = await persistSessionStart(request);

    if (!result.ok) {
      setErrorMessage(result.error.message);
      setIsSaving(false);
      return;
    }

    setStartedAt(result.data.startedAt);
    setIsSaving(false);
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

      {inputMode === "voice" ? <Text style={styles.hint}>Voice uses text fallback in this story.</Text> : null}
      {startedAt ? <Text style={styles.running}>Timer running: {elapsedSeconds}s</Text> : null}
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
  running: {
    color: "#065f46",
    fontWeight: "600"
  },
  error: {
    color: "#b91c1c"
  }
});
