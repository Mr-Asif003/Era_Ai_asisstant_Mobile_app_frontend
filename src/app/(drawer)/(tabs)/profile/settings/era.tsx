import React, { useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Sparkles, Radio, Mic, Volume2, Zap, Info, Bell, Trash2, AlertTriangle,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function EraSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    wakeWord: true, voiceResponse: true, autoSummarise: true,
    digestTime: "8:00 AM", voiceMode: true, smartReplies: true, contextMemory: true,
  });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Era AI Settings" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ margin: 16 }}>
          <LinearGradient
            colors={["rgba(219,39,119,0.15)", "rgba(124,58,237,0.15)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.banner}
          >
            <Sparkles size={22} color={C.pink} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={s.bannerTitle}>Era AI</Text>
              <Text style={s.bannerSub}>Your personal voice & chat assistant</Text>
            </View>
          </LinearGradient>
        </View>

        <SectionHeader title="Voice" icon={<Radio size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Mic size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label={'"Hey Era" Wake Word'} toggle toggleValue={settings.wakeWord} onToggle={() => toggle("wakeWord")} />
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Voice Responses" toggle toggleValue={settings.voiceResponse} onToggle={() => toggle("voiceResponse")} />
          <SettingRow icon={<Radio size={18} color="#fff" strokeWidth={2} />} iconBg="#F472B6"
            label="Voice Mode" toggle toggleValue={settings.voiceMode} onToggle={() => toggle("voiceMode")} last />
        </Card>

        <SectionHeader title="Intelligence" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Auto-Summarise Chats" toggle toggleValue={settings.autoSummarise} onToggle={() => toggle("autoSummarise")} />
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Smart Replies" toggle toggleValue={settings.smartReplies} onToggle={() => toggle("smartReplies")} />
          <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Context Memory" toggle toggleValue={settings.contextMemory} onToggle={() => toggle("contextMemory")} last />
        </Card>

        <SectionHeader title="Daily Digest" icon={<Bell size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Bell size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Morning Digest" value={settings.digestTime}
            onPress={() => Alert.alert("Digest Time", "Time picker coming soon")} last />
        </Card>

        <SectionHeader title="Danger Zone" icon={<AlertTriangle size={12} color={C.red} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Clear Era Memory" danger
            onPress={() => Alert.alert("Clear Memory", "This will reset all of Era's context and conversation history.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => {} },
            ])} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(244,114,182,0.2)",
  },
  bannerTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  bannerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
});