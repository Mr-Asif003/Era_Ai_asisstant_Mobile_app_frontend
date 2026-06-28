import { Stack } from "expo-router";
import { COLORS } from "@/lib/constants";

export default function PulseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg.primary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="[taskId]" />
      {/* <Stack.Screen name="mentions" /> */}
      <Stack.Screen name="activity" />
    </Stack>
  );
}