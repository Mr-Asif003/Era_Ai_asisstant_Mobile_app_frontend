import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Eye, Check, Globe, MessageSquare, Shield, Lock, Link, Download, Trash2,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    lastSeen: true, readReceipts: true, onlineStatus: true,
    typingIndicator: true, twoFactor: false,
  });
  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Privacy & Security" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Visibility" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Eye size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Last Seen" toggle toggleValue={settings.lastSeen} onToggle={() => toggle("lastSeen")} />
          <SettingRow icon={<Check size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Read Receipts" toggle toggleValue={settings.readReceipts} onToggle={() => toggle("readReceipts")} />
          <SettingRow icon={<Globe size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Online Status" toggle toggleValue={settings.onlineStatus} onToggle={() => toggle("onlineStatus")} />
          <SettingRow icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Typing Indicator" toggle toggleValue={settings.typingIndicator} onToggle={() => toggle("typingIndicator")} last />
        </Card>

        <SectionHeader title="Account Security" icon={<Shield size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Shield size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Two-Factor Auth" toggle toggleValue={settings.twoFactor} onToggle={() => toggle("twoFactor")}
            badge={!settings.twoFactor ? "Off" : undefined} />
          <SettingRow icon={<Lock size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label="Change Password" onPress={() => Alert.alert("Change Password", "Coming soon")} />
          <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Active Sessions" value="2 devices" onPress={() => Alert.alert("Sessions", "Manage active sessions")} last />
        </Card>

        <SectionHeader title="Data" icon={<Download size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Download size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Export My Data" onPress={() => Alert.alert("Export Data", "We'll email you a copy of your data within 24 hours.")} />
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Delete Account" danger onPress={() =>
              Alert.alert("Delete Account", "This will permanently delete your account and all data. This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => {} },
              ])
            } last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}