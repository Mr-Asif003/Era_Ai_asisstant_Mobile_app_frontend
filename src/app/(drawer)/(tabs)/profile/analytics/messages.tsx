import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MessageSquare, Mic, Image as ImageIcon, FileText, Clock } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

const TYPE_BREAKDOWN = [
  { label: "Text",       count: 186, percent: 75, color: C.indigo, icon: MessageSquare },
  { label: "Voice Notes",count: 38,  percent: 15, color: "#F472B6", icon: Mic           },
  { label: "Images",     count: 18,  percent: 7,  color: "#10B981", icon: ImageIcon      },
  { label: "Files",      count: 6,   percent: 3,  color: "#F59E0B", icon: FileText        },
];

const HOURLY_PEAK = [
  { hour: "6AM", value: 4 }, { hour: "9AM", value: 22 }, { hour: "12PM", value: 38 },
  { hour: "3PM", value: 31 }, { hour: "6PM", value: 45 }, { hour: "9PM", value: 28 }, { hour: "12AM", value: 9 },
];

export default function MessageAnalyticsScreen() {
  const router = useRouter();
  const max = Math.max(...HOURLY_PEAK.map((h) => h.value));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Message Analytics" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Total card */}
        <View style={s.totalCard}>
          <Text style={s.totalValue}>248</Text>
          <Text style={s.totalLabel}>Total messages sent this month</Text>
        </View>

        <SectionHeader title="By Type" />
        <Card>
          {TYPE_BREAKDOWN.map((t, i) => (
            <View key={t.label} style={[s.typeRow, i < TYPE_BREAKDOWN.length - 1 && s.rowBorder]}>
              <View style={[s.typeIcon, { backgroundColor: `${t.color}18` }]}>
                <t.icon size={16} color={t.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.typeTop}>
                  <Text style={s.typeLabel}>{t.label}</Text>
                  <Text style={s.typeCount}>{t.count}</Text>
                </View>
                <View style={s.typeBarBg}>
                  <View style={[s.typeBarFill, { width: `${t.percent}%`, backgroundColor: t.color }]} />
                </View>
              </View>
            </View>
          ))}
        </Card>

        <SectionHeader title="Peak Activity Hours" icon={<Clock size={12} color={C.dim} strokeWidth={2} />} />
        <Card style={{ padding: 18 }}>
          <View style={s.hourlyChart}>
            {HOURLY_PEAK.map((h) => (
              <View key={h.hour} style={s.hourCol}>
                <View style={s.hourTrack}>
                  <LinearGradient
                    colors={[C.indigoD, C.indigo]}
                    style={[s.hourBar, { height: `${(h.value / max) * 100}%` as any }]}
                  />
                </View>
                <Text style={s.hourLabel}>{h.hour}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionHeader title="Response Times" />
        <Card>
          <View style={s.respRow}>
            <Text style={s.respLabel}>Average response time</Text>
            <Text style={s.respValue}>2.4 minutes</Text>
          </View>
          <View style={[s.respRow, s.rowBorder]}>
            <Text style={s.respLabel}>Fastest response</Text>
            <Text style={[s.respValue, { color: C.green }]}>8 seconds</Text>
          </View>
          <View style={[s.respRow, s.rowBorder]}>
            <Text style={s.respLabel}>Messages read instantly</Text>
            <Text style={s.respValue}>68%</Text>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  totalCard: {
    margin: 16, backgroundColor: C.bg1, borderRadius: 20, borderWidth: 1,
    borderColor: C.border, padding: 24, alignItems: "center", gap: 4,
  },
  totalValue: { fontSize: 36, fontWeight: "800", color: C.indigoL },
  totalLabel: { fontSize: 13, color: C.muted },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  typeIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  typeTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  typeLabel: { fontSize: 13, color: C.text, fontWeight: "600" },
  typeCount: { fontSize: 13, color: C.muted, fontWeight: "600" },
  typeBarBg: { height: 5, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden" },
  typeBarFill: { height: 5, borderRadius: 3 },
  hourlyChart: { flexDirection: "row", justifyContent: "space-between", height: 100 },
  hourCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 },
  hourTrack: { width: 14, height: 76, justifyContent: "flex-end" },
  hourBar: { width: 14, borderRadius: 4 },
  hourLabel: { fontSize: 9, color: C.dim },
  respRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  respLabel: { fontSize: 14, color: C.text },
  respValue: { fontSize: 14, color: C.indigoL, fontWeight: "700" },
});