import React from "react";
import { Tabs, Redirect } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { usePulse } from "../../../hooks/usePulse";
import { COLORS } from "@/lib/constants";
import {
  MessageCircle,
  Sparkles,
  Zap,
  CircleUserRound,
} from "lucide-react-native";

interface TabIconProps {
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, label, icon, badge }) => (
  <View style={styles.wrap}>
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {icon}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </View>
    <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
  </View>
);

export default function TabLayout() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthenticated = true;
  const { totalBadgeCount } = usePulse();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS?.bg?.secondary ?? "#111827",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 6,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Chats"
              icon={<MessageCircle size={20} color={focused ? "#FFFFFF" : "#8E95A5"} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="era"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Era"
              icon={<Sparkles size={20} color={focused ? "#FFFFFF" : "#8E95A5"} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pulse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Pulse"
              icon={<Zap size={20} color={focused ? "#FFFFFF" : "#8E95A5"} />}
              badge={totalBadgeCount}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Profile"
              icon={<CircleUserRound size={20} color={focused ? "#FFFFFF" : "#8E95A5"} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: 4, width: 70 },
  iconWrap: {
    width: 48, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  iconWrapActive: { backgroundColor: "#6366F1" },
  label: { fontSize: 11, color: "#8E95A5", fontWeight: "500" },
  labelActive: { color: "#FFFFFF", fontWeight: "700" },
  badge: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: "#EF4444", minWidth: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },
});