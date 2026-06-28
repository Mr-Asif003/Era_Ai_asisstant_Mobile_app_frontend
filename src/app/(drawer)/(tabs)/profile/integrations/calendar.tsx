import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Check, Unplug, Sparkles, Plus, Clock } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState(true);
  const [settings, setSettings] = useState({
    autoCreateEvents: true,
    remindMe: true,
    syncReminders: true,
  });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const handleDisconnect = () => {
    Alert.alert("Disconnect Calendar", "Era will no longer be able to view or create events.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => setConnected(false) },
    ]);
  };

  const TODAY_EVENTS = [
    { time: "10:00 AM", title: "Team Standup",      color: "#4285F4" },
    { time: "1:00 PM",  title: "Design Review",      color: "#6366F1" },
    { time: "4:00 PM",  title: "Client Call",         color: "#EC4899" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Google Calendar" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Calendar size={36} color="#4285F4" strokeWidth={1.5} />
          </View>
          <Text style={s.heroTitle}>Google Calendar</Text>
          <Text style={s.heroSub}>
            {connected
              ? "Connected — Era can view your schedule and create events"
              : "Connect to let Era manage your calendar and remind you of meetings"}
          </Text>

          {connected ? (
            <View style={s.connectedPill}>
              <Check size={12} color={C.green} strokeWidth={3} />
              <Text style={s.connectedPillText}>your.email@gmail.com</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setConnected(true)} activeOpacity={0.85} style={{ width: "100%", marginTop: 12 }}>
              <LinearGradient colors={["#4285F4", "#1A73E8"]} style={s.connectBtn}>
                <Calendar size={18} color="#fff" strokeWidth={2} />
                <Text style={s.connectBtnText}>Connect Calendar</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {connected && (
          <>
            <SectionHeader title="Today's Schedule" icon={<Clock size={12} color={C.dim} strokeWidth={2} />} />
            <Card>
              {TODAY_EVENTS.map((event, i) => (
                <View key={event.title} style={[s.eventRow, i < TODAY_EVENTS.length - 1 && s.eventBorder]}>
                  <View style={[s.eventDot, { backgroundColor: event.color }]} />
                  <Text style={s.eventTime}>{event.time}</Text>
                  <Text style={s.eventTitle}>{event.title}</Text>
                </View>
              ))}
            </Card>

            <SectionHeader title="Era Permissions" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
            <Card>
              <SettingRow icon={<Plus size={18} color="#fff" strokeWidth={2} />} iconBg="#4285F4"
                label="Allow Era to Create Events" toggle toggleValue={settings.autoCreateEvents} onToggle={() => toggle("autoCreateEvents")} />
              <SettingRow icon={<Clock size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
                label="Remind Me Before Events" toggle toggleValue={settings.remindMe} onToggle={() => toggle("remindMe")} />
              <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
                label="Sync with Era Reminders" toggle toggleValue={settings.syncReminders} onToggle={() => toggle("syncReminders")} last />
            </Card>

            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <TouchableOpacity onPress={handleDisconnect} style={s.disconnectBtn}>
                <Unplug size={16} color={C.red} strokeWidth={2} />
                <Text style={s.disconnectText}>Disconnect Calendar</Text>
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
    width: 76, height: 76, borderRadius: 24, backgroundColor: "rgba(66,133,244,0.1)",
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
  eventRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 13 },
  eventBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventTime: { fontSize: 12, color: C.muted, fontWeight: "600", width: 70 },
  eventTitle: { fontSize: 14, color: C.text, fontWeight: "500", flex: 1 },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, paddingVertical: 14,
  },
  disconnectText: { fontSize: 14, color: C.red, fontWeight: "600" },
});