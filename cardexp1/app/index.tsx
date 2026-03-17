import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CardWork Foundation Ready</Text>
      <Link href="/explore" style={styles.link}>
        Explore Route
      </Link>
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
  link: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600"
  }
});
