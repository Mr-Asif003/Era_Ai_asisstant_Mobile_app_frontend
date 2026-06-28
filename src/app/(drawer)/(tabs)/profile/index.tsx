import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  User, Bell, Lock, Palette, MessageSquare, Sparkles, Radio,
  Globe, HelpCircle, LogOut, Star, Info, AlertTriangle,
  Edit3, QrCode, BarChart3, Plug,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { C, SectionHeader, Card, SettingRow } from "./_shared";

const AVATAR_GRADIENTS: [string, string][] = [
  ["#6366F1", "#8B5CF6"],
  ["#EC4899", "#F43F5E"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#DB2777", "#7C3AED"],
  ["#0EA5E9", "#6366F1"],
];

export default function ProfileHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const headerY = useSharedValue(-10);
  const headerO = useSharedValue(0);

  useEffect(() => {
    headerY.value = withSpring(0, { damping: 14 });
    headerO.value = withTiming(1, { duration: 500 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerO.value,
    transform: [{ translateY: headerY.value }],
  }));

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => await logout() },
    ]);
  };

  const initial = user?.displayName?.[0]?.toUpperCase() ?? "A";

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Profile card ── */}
        <Animated.View style={headerStyle}>
          <LinearGradient colors={["rgba(99,102,241,0.12)", "transparent"]} style={s.profileCard}>
            <TouchableOpacity onPress={() => router.push("/(drawer)/(tabs)/profile/qr" as any)} style={s.qrBtn}>
              <QrCode size={18} color={C.indigoL} strokeWidth={2} />
            </TouchableOpacity>

            <View style={s.avatarWrap}>
              <LinearGradient colors={AVATAR_GRADIENTS[0]} style={s.avatar}>
                <Text style={s.avatarInitial}>{initial}</Text>
              </LinearGradient>
              <View style={s.onlineDot} />
            </View>

            <Text style={s.profileName}>{user?.displayName ?? "Asif Khan"}</Text>
            <Text style={s.profileUsername}>@{user?.username ?? "asifkhan"}</Text>
            <Text style={s.profileBio}>
              {(user as any)?.bio || "Building Era Chat 🚀 Full-stack dev"}
            </Text>

            <View style={s.statsRow}>
              {[
                { label: "Chats", value: "24" },
                { label: "Contacts", value: "138" },
                { label: "Messages", value: "1.2k" },
              ].map((stat, i) => (
                <View key={stat.label} style={[s.stat, i < 2 && s.statBorder]}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push("/(drawer)/(tabs)/profile/edit" as any)}
              activeOpacity={0.85}
            >
              <Edit3 size={15} color={C.indigoL} strokeWidth={2} />
              <Text style={s.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* ── Era AI ── */}
        <SectionHeader title="Era AI" icon={<Sparkles size={12} color={C.pink} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<Sparkles size={18} color="#fff" strokeWidth={2} />}
            iconBg="#DB2777"
            label="Era AI Settings"
            value="Configured"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/era" as any)}
          />
          <SettingRow
            icon={<Radio size={18} color="#fff" strokeWidth={2} />}
            iconBg="#7C3AED"
            label="Voice & Commands"
            value="Hey Era"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/era" as any)}
            last
          />
        </Card>

        {/* ── Account ── */}
        <SectionHeader title="Account" icon={<User size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<User size={18} color="#fff" strokeWidth={2} />}
            iconBg="#6366F1"
            label="Edit Profile"
            onPress={() => router.push("/(drawer)/(tabs)/profile/edit" as any)}
          />
          <SettingRow
            icon={<Bell size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F59E0B"
            label="Notifications"
            badge="3"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/notifications" as any)}
          />
          <SettingRow
            icon={<Lock size={18} color="#fff" strokeWidth={2} />}
            iconBg="#EF4444"
            label="Privacy & Security"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/privacy" as any)}
            last
          />
        </Card>

        {/* ── Preferences ── */}
        <SectionHeader title="Preferences" icon={<Palette size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<Palette size={18} color="#fff" strokeWidth={2} />}
            iconBg="#8B5CF6"
            label="Appearance"
            value="Dark"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/appearance" as any)}
          />
          <SettingRow
            icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />}
            iconBg="#0EA5E9"
            label="Chat Settings"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/chat" as any)}
          />
          <SettingRow
            icon={<Globe size={18} color="#fff" strokeWidth={2} />}
            iconBg="#10B981"
            label="Language"
            value="English"
            onPress={() => router.push("/(drawer)/(tabs)/profile/settings/language" as any)}
            last
          />
        </Card>

        {/* ── Connected Apps ── */}
        <SectionHeader title="Connected Apps" icon={<Plug size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<Plug size={18} color="#fff" strokeWidth={2} />}
            iconBg="#6366F1"
            label="Integrations Hub"
            value="2 connected"
            onPress={() => router.push("/(drawer)/(tabs)/profile/integrations" as any)}
            last
          />
        </Card>

        {/* ── Insights ── */}
        <SectionHeader title="Insights" icon={<BarChart3 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<BarChart3 size={18} color="#fff" strokeWidth={2} />}
            iconBg="#0EA5E9"
            label="Usage Analytics"
            onPress={() => router.push("/(drawer)/(tabs)/profile/analytics" as any)}
            last
          />
        </Card>

        {/* ── Support ── */}
        <SectionHeader title="Support" icon={<HelpCircle size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<HelpCircle size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F472B6"
            label="Help & Support"
            onPress={() => router.push("/(drawer)/(tabs)/profile/support" as any)}
          />
          <SettingRow
            icon={<Star size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F59E0B"
            label="Rate Era Chat"
            onPress={() => Alert.alert("Rate Us", "Thanks for the love! 🌸")}
          />
          <SettingRow
            icon={<Info size={18} color="#fff" strokeWidth={2} />}
            iconBg="#6366F1"
            label="About"
            value="v1.0.0"
            onPress={() => router.push("/(drawer)/(tabs)/profile/support/about" as any)}
            last
          />
        </Card>

        {/* ── Danger zone ── */}
        <SectionHeader title="Account Actions" icon={<AlertTriangle size={12} color={C.red} strokeWidth={2} />} />
        <Card>
          <SettingRow
            icon={<LogOut size={18} color="#fff" strokeWidth={2} />}
            iconBg={C.red}
            label="Sign Out"
            danger
            onPress={handleLogout}
            last
          />
        </Card>

        <Text style={s.footer}>Era Chat v1.0.0 · Made with 🌸</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },
  profileCard: {
    alignItems: "center", paddingHorizontal: 24, paddingTop: 24,
    paddingBottom: 20, gap: 6, position: "relative",
  },
  qrBtn: {
    position: "absolute", top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(99,102,241,0.35)",
  },
  avatarInitial: { fontSize: 38, fontWeight: "700", color: "#fff" },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.green, borderWidth: 3, borderColor: C.bg0,
  },
  profileName: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5, marginTop: 4 },
  profileUsername: { fontSize: 14, color: C.indigoL, fontWeight: "500" },
  profileBio: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 20, marginTop: 4, paddingHorizontal: 20 },
  statsRow: {
    flexDirection: "row", backgroundColor: C.bg2, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, marginTop: 16, width: "100%", overflow: "hidden",
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 3 },
  statBorder: { borderRightWidth: 1, borderRightColor: C.border },
  statValue: { fontSize: 18, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: "500" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 10,
  },
  editBtnText: { fontSize: 14, color: C.indigoL, fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 12, color: C.dim, marginTop: 24, marginBottom: 8 },
});