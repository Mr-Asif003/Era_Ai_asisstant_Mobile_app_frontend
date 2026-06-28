import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Mic, MessageSquare, Zap, Clock, Target } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

const COMMAND_TYPES = [
  { label: "Read Messages",  count: 22, color: C.indigo },
  { label: "Summarise Chat", count: 18, color: "#DB2777" },
  { label: "Send Message",   count: 12, color: "#10B981" },
  { label: "Search",         count: 8,  color: "#0EA5E9" },
  { label: "Daily Digest",   count: 4,  color: "#F59E0B" },
];

export default function EraAnalyticsScreen() {
  const router = useRouter();
  const total = COMMAND_TYPES.reduce((a, c) => a + c.count, 0);
  const max = Math.max(...COMMAND_TYPES.map((c) => c.count));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Era Usage Insights" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero card */}
        <View style={{ margin: 16 }}>
          <LinearGradient
            colors={["rgba(219,39,119,0.18)", "rgba(124,58,237,0.12)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.hero}
          >
            <Sparkles size={28} color={C.pink} strokeWidth={1.5} />
            <Text style={s.heroValue}>{total}</Text>
            <Text style={s.heroLabel}>commands handled this month</Text>
          </LinearGradient>
        </View>

        {/* Quick stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Mic size={16} color={C.pink} strokeWidth={2} />
            <Text style={s.statValue}>34%</Text>
            <Text style={s.statLabel}>Voice commands</Text>
          </View>
          <View style={s.statCard}>
            <Clock size={16} color="#F59E0B" strokeWidth={2} />
            <Text style={s.statValue}>1.8s</Text>
            <Text style={s.statLabel}>Avg response time</Text>
          </View>
          <View style={s.statCard}>
            <Target size={16} color="#10B981" strokeWidth={2} />
            <Text style={s.statValue}>94%</Text>
            <Text style={s.statLabel}>Accuracy rate</Text>
          </View>
        </View>

        {/* Command breakdown */}
        <SectionHeader title="Most Used Commands" icon={<Zap size={12} color={C.dim} strokeWidth={2} />} />
        <Card style={{ padding: 16, gap: 14 }}>
          {COMMAND_TYPES.map((cmd) => (
            <View key={cmd.label} style={{ gap: 6 }}>
              <View style={s.cmdTop}>
                <Text style={s.cmdLabel}>{cmd.label}</Text>
                <Text style={s.cmdCount}>{cmd.count}</Text>
              </View>
              <View style={s.cmdBarBg}>
                <View style={[s.cmdBarFill, { width: `${(cmd.count / max) * 100}%`, backgroundColor: cmd.color }]} />
              </View>
            </View>
          ))}
        </Card>

        {/* Mode split */}
        <SectionHeader title="Interaction Mode" icon={<MessageSquare size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <View style={s.modeRow}>
            <View style={s.modeBlock}>
              <Text style={s.modePercent}>66%</Text>
              <Text style={s.modeLabel}>Text Mode</Text>
            </View>
            <View style={[s.modeBlock, s.modeBorder]}>
              <Text style={[s.modePercent, { color: C.pink }]}>34%</Text>
              <Text style={s.modeLabel}>Voice Mode</Text>
            </View>
          </View>
        </Card>

        {/* Weekly trend note */}
        <View style={s.noteCard}>
          <Sparkles size={16} color={C.pink} strokeWidth={2} />
          <Text style={s.noteText}>
            Era usage increased 32% this week. You're relying on voice mode more often during evenings.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: {
    borderRadius: 20, padding: 24, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: "rgba(244,114,182,0.25)",
  },
  heroValue: { fontSize: 32, fontWeight: "800", color: C.text, marginTop: 8 },
  heroLabel: { fontSize: 13, color: C.muted },
  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  statCard: {
    flex: 1, alignItems: "center", backgroundColor: C.bg1, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, paddingVertical: 14, gap: 4,
  },
  statValue: { fontSize: 16, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 10, color: C.muted, textAlign: "center" },
  cmdTop: { flexDirection: "row", justifyContent: "space-between" },
  cmdLabel: { fontSize: 13, color: C.text, fontWeight: "600" },
  cmdCount: { fontSize: 13, color: C.muted, fontWeight: "600" },
  cmdBarBg: { height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden" },
  cmdBarFill: { height: 6, borderRadius: 3 },
  modeRow: { flexDirection: "row" },
  modeBlock: { flex: 1, alignItems: "center", paddingVertical: 20, gap: 4 },
  modeBorder: { borderLeftWidth: 1, borderLeftColor: C.border },
  modePercent: { fontSize: 24, fontWeight: "800", color: C.indigoL },
  modeLabel: { fontSize: 12, color: C.muted },
  noteCard: {
    flexDirection: "row", gap: 10, margin: 16, backgroundColor: "rgba(244,114,182,0.08)",
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(244,114,182,0.2)",
  },
  noteText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
});