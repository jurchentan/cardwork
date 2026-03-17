import { Stack } from "expo-router";
import { useEffect } from "react";

import { initializeDatabase } from "@/database/client";

export default function RootLayout() {
  useEffect(() => {
    void initializeDatabase();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
