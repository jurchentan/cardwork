import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  getSessionHomePrimaryActionRoute,
  HOME_TO_RUNNING_SESSION_TAP_COUNT
} from "@/features/sessions/ui/session-start-flow";

export default function HomeScreen() {
  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CardWork</Text>
      <Text style={styles.subtitle}>Log your intent and start in two taps.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setTapCount((value) => value + 1);
          router.push(getSessionHomePrimaryActionRoute() as never);
        }}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText}>Start Session</Text>
      </Pressable>
      <Text style={styles.helperText}>Home to running timer target: {HOME_TO_RUNNING_SESSION_TAP_COUNT} taps</Text>
      <Text style={styles.tapText}>Home button taps: {tapCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  title: {
    fontSize: 22,
    fontWeight: "700"
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 15,
    textAlign: "center"
  },
  startButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  helperText: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center"
  },
  tapText: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  }
});
