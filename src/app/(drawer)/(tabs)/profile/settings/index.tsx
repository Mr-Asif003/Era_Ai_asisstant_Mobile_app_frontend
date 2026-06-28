import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bell, Lock, Palette, MessageSquare, Sparkles,
  Globe, HardDrive, Accessibility,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function SettingsHomeScreen() {
  const router = useRouter();
  const go = (path: string) => router.push(`/(drawer)/(tabs)/profile/settings/${path}` as any);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Settings" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Preferences" />
        <Card>
          <SettingRow icon={<Bell size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Notifications" badge="3" onPress={() => go("notifications")} />
          <SettingRow icon={<Lock size={18} color="#fff" strokeWidth={2} />} iconBg="#EF4444"
            label="Privacy & Security" onPress={() => go("privacy")} />
          <SettingRow icon={<Palette size={18} color="#fff" strokeWidth={2} />} iconBg="#8B5CF6"
            label="Appearance" value="Dark" onPress={() => go("appearance")} />
          <SettingRow icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Chat Settings" onPress={() => go("chat")} />
          <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label="Era AI Settings" onPress={() => go("era")} last />
        </Card>

        <SectionHeader title="System" />
        <Card>
          <SettingRow icon={<Globe size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Language & Region" value="English" onPress={() => go("language")} />
          <SettingRow icon={<HardDrive size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Storage & Data" value="1.2 GB" onPress={() => go("storage")} />
          <SettingRow icon={<Accessibility size={18} color="#fff" strokeWidth={2} />} iconBg="#F472B6"
            label="Accessibility" onPress={() => go("accessibility")} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}