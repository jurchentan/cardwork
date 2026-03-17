import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import {
  getSessionHomePrimaryActionRoute,
  HOME_TO_RUNNING_SESSION_TAP_COUNT
} from "@/features/sessions/ui/session-start-flow";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CardWork</Text>
      <Text style={styles.subtitle}>Log your intent and start in two taps.</Text>
      <Link href={getSessionHomePrimaryActionRoute() as never} style={styles.link}>
        Start Session
      </Link>
      <Text style={styles.helperText}>Home to running timer target: {HOME_TO_RUNNING_SESSION_TAP_COUNT} taps</Text>
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
  link: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600"
  },
  helperText: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center"
  }
});
