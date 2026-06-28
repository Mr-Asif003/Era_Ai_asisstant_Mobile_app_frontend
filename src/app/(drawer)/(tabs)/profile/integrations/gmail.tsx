import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Check, Unplug, Bell, Sparkles, Send } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function GmailIntegrationScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState(true);
  const [settings, setSettings] = useState({
    autoSummarise: true,
    notifyUnread: true,
    eraCanSend: false,
  });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const handleConnect = () => {
    // TODO Phase 8: trigger Google OAuth flow via expo-auth-session
    setConnected(true);
  };

  const handleDisconnect = () => {
    Alert.alert("Disconnect Gmail", "Era will no longer be able to read or send emails.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => setConnected(false) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Gmail" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Mail size={36} color="#EA4335" strokeWidth={1.5} />
          </View>
          <Text style={s.heroTitle}>Gmail</Text>
          <Text style={s.heroSub}>
            {connected ? "Connected — Era can read and manage your inbox" : "Connect your Gmail account to let Era summarise and send emails"}
          </Text>

          {connected ? (
            <View style={s.connectedPill}>
              <Check size={12} color={C.green} strokeWidth={3} />
              <Text style={s.connectedPillText}>your.email@gmail.com</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleConnect} activeOpacity={0.85} style={{ width: "100%", marginTop: 12 }}>
              <LinearGradient colors={["#EA4335", "#C62828"]} style={s.connectBtn}>
                <Mail size={18} color="#fff" strokeWidth={2} />
                <Text style={s.connectBtnText}>Connect Gmail Account</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {connected && (
          <>
            {/* Quick stats */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statValue}>12</Text>
                <Text style={s.statLabel}>Unread</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>3</Text>
                <Text style={s.statLabel}>Flagged</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>847</Text>
                <Text style={s.statLabel}>Total</Text>
              </View>
            </View>

            <SectionHeader title="Era Permissions" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
            <Card>
              <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
                label="Auto-Summarise Inbox" toggle toggleValue={settings.autoSummarise} onToggle={() => toggle("autoSummarise")} />
              <SettingRow icon={<Bell size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
                label="Notify on Unread" toggle toggleValue={settings.notifyUnread} onToggle={() => toggle("notifyUnread")} />
              <SettingRow icon={<Send size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
                label="Allow Era to Send Emails" toggle toggleValue={settings.eraCanSend} onToggle={() => toggle("eraCanSend")} last />
            </Card>

            <SectionHeader title="Try It" />
            <Card>
              <SettingRow icon={<Mail size={18} color="#fff" strokeWidth={2} />} iconBg="#EA4335"
                label="Ask Era to read your inbox" onPress={() => router.push("/(drawer)/(tabs)/era" as any)} last />
            </Card>

            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <TouchableOpacity onPress={handleDisconnect} style={s.disconnectBtn}>
                <Unplug size={16} color={C.red} strokeWidth={2} />
                <Text style={s.disconnectText}>Disconnect Gmail</Text>
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
    width: 76, height: 76, borderRadius: 24, backgroundColor: "rgba(234,67,53,0.1)",
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
  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  statCard: {
    flex: 1, alignItems: "center", backgroundColor: C.bg1, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, paddingVertical: 14,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, paddingVertical: 14,
  },
  disconnectText: { fontSize: 14, color: C.red, fontWeight: "600" },
});