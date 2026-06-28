import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bell, MessageSquare, Zap, Star, Mic, Globe, Sparkles,
  Volume2, Smartphone, Eye, Moon,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    messages: true, mentions: true, reactions: false, voiceNotes: true,
    groupMessages: true, eraDigest: true, sound: true, vibration: true,
    preview: true, doNotDisturb: false,
  });
  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Notifications" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Messages" icon={<Bell size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="New Messages" toggle toggleValue={settings.messages} onToggle={() => toggle("messages")} />
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Mentions" toggle toggleValue={settings.mentions} onToggle={() => toggle("mentions")} />
          <SettingRow icon={<Star size={18} color="#fff" strokeWidth={2} />} iconBg="#EC4899"
            label="Reactions" toggle toggleValue={settings.reactions} onToggle={() => toggle("reactions")} />
          <SettingRow icon={<Mic size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Voice Notes" toggle toggleValue={settings.voiceNotes} onToggle={() => toggle("voiceNotes")} />
          <SettingRow icon={<Globe size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Group Messages" toggle toggleValue={settings.groupMessages} onToggle={() => toggle("groupMessages")} last />
        </Card>

        <SectionHeader title="Era AI" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Daily Digest" toggle toggleValue={settings.eraDigest} onToggle={() => toggle("eraDigest")} last />
        </Card>

        <SectionHeader title="Sound & Vibration" icon={<Volume2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#F472B6"
            label="Notification Sound" toggle toggleValue={settings.sound} onToggle={() => toggle("sound")} />
          <SettingRow icon={<Smartphone size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Vibration" toggle toggleValue={settings.vibration} onToggle={() => toggle("vibration")} last />
        </Card>

        <SectionHeader title="Display" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Eye size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Show Preview" toggle toggleValue={settings.preview} onToggle={() => toggle("preview")} />
          <SettingRow icon={<Moon size={18} color="#fff" strokeWidth={2} />} iconBg="#4C1D95"
            label="Do Not Disturb" toggle toggleValue={settings.doNotDisturb} onToggle={() => toggle("doNotDisturb")} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}