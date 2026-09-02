import { Stack } from "expo-router";
import { COLORS } from "@/lib/constants";

export default function ChatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg.primary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="Contactscreen" />
    </Stack>
  );
}