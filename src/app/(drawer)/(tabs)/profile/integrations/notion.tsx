import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, Check, Unplug, Sparkles } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function NotionIntegrationScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState({ createNotes: true, syncTasks: false });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Notion" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.hero}>
          <View style={s.heroIcon}>
            <FileText size={36} color="#fff" strokeWidth={1.5} />
          </View>
          <Text style={s.heroTitle}>Notion</Text>
          <Text style={s.heroSub}>
            {connected
              ? "Connected — Era can create and search Notion pages"
              : "Connect Notion to let Era create notes and pages from your voice or text commands"}
          </Text>

          {connected ? (
            <View style={s.connectedPill}>
              <Check size={12} color={C.green} strokeWidth={3} />
              <Text style={s.connectedPillText}>Workspace connected</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setConnected(true)} activeOpacity={0.85} style={{ width: "100%", marginTop: 12 }}>
              <LinearGradient colors={["#2F2F2F", "#000"]} style={s.connectBtn}>
                <FileText size={18} color="#fff" strokeWidth={2} />
                <Text style={s.connectBtnText}>Connect Notion Workspace</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {connected && (
          <>
            <SectionHeader title="Era Permissions" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
            <Card>
              <SettingRow icon={<FileText size={18} color="#fff" strokeWidth={2} />} iconBg="#2F2F2F"
                label="Allow Era to Create Notes" toggle toggleValue={settings.createNotes} onToggle={() => toggle("createNotes")} />
              <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
                label="Sync Tasks with Notion" toggle toggleValue={settings.syncTasks} onToggle={() => toggle("syncTasks")} last />
            </Card>

            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setConnected(false)} style={s.disconnectBtn}>
                <Unplug size={16} color={C.red} strokeWidth={2} />
                <Text style={s.disconnectText}>Disconnect Notion</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: "center", padding: 24, gap: 8 },
  heroIcon: {
    width: 76, height: 76, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  heroTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  heroSub: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 19, paddingHorizontal: 16 },
  connectedPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(34,197,94,0.1)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 12,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.25)",
  },
  connectedPillText: { fontSize: 13, color: C.green, fontWeight: "600" },
  connectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  connectBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, paddingVertical: 14,
  },
  disconnectText: { fontSize: 14, color: C.red, fontWeight: "600" },
});