import { Stack } from "expo-router";
import { COLORS } from "@/lib/constants";

export default function EraLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg.primary } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}