import { Stack } from "expo-router";
import { COLORS } from "@/lib/constants";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg.primary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="qr" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/chat" />
      <Stack.Screen name="settings/era" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/storage" />
      <Stack.Screen name="settings/accessibility" />
      <Stack.Screen name="integrations/index" />
      <Stack.Screen name="integrations/gmail" />
      <Stack.Screen name="integrations/calendar" />
      <Stack.Screen name="integrations/notion" />
      <Stack.Screen name="integrations/slack" />
      <Stack.Screen name="integrations/spotify" />
      <Stack.Screen name="integrations/webhook" />
      <Stack.Screen name="analytics/index" />
      <Stack.Screen name="analytics/messages" />
      <Stack.Screen name="analytics/era" />
      <Stack.Screen name="support/index" />
      <Stack.Screen name="support/about" />
      <Stack.Screen name="support/bug" />
      <Stack.Screen name="support/feedback" />
    </Stack>
  );
}