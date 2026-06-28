import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MessageSquare, Sparkles, Mic, Clock, TrendingUp, ChevronRight, Users,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

const WEEK_DATA = [
  { day: "Mon", value: 32 }, { day: "Tue", value: 48 }, { day: "Wed", value: 28 },
  { day: "Thu", value: 56 }, { day: "Fri", value: 41 }, { day: "Sat", value: 19 }, { day: "Sun", value: 24 },
];

const BarChart: React.FC = () => {
  const max = Math.max(...WEEK_DATA.map((d) => d.value));
  return (
    <View style={bc.wrap}>
      {WEEK_DATA.map((d) => (
        <View key={d.day} style={bc.col}>
          <View style={bc.barTrack}>
            <LinearGradient
              colors={[C.indigoD, C.indigo]}
              style={[bc.bar, { height: `${(d.value / max) * 100}%` as any }]}
            />
          </View>
          <Text style={bc.label}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
};

const bc = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", height: 140, paddingHorizontal: 4 },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 8 },
  barTrack: { width: 20, height: 110, justifyContent: "flex-end" },
  bar: { width: 20, borderRadius: 6 },
  label: { fontSize: 11, color: C.dim, fontWeight: "500" },
});

const StatBlock: React.FC<{ icon: React.FC<any>; label: string; value: string; sub: string; color: string }> = ({
  icon: Icon, label, value, sub, color,
}) => (
  <View style={st.card}>
    <View style={[st.iconWrap, { backgroundColor: `${color}18` }]}>
      <Icon size={18} color={color} strokeWidth={2} />
    </View>
    <Text style={st.value}>{value}</Text>
    <Text style={st.label}>{label}</Text>
    <Text style={st.sub}>{sub}</Text>
  </View>
);

const st = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: C.bg1, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 14, gap: 4,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "700", color: C.text },
  label: { fontSize: 12, color: C.muted, fontWeight: "600" },
  sub: { fontSize: 10, color: C.green, marginTop: 2 },
});

export default function AnalyticsOverviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Usage Analytics" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Stat grid */}
        <View style={s.statsGrid}>
          <StatBlock icon={MessageSquare} label="Messages" value="248" sub="↑ 18% this week" color={C.indigo} />
          <StatBlock icon={Sparkles} label="Era Commands" value="64" sub="↑ 32% this week" color={C.pink} />
        </View>
        <View style={s.statsGrid}>
          <StatBlock icon={Mic} label="Voice Notes" value="19" sub="↓ 4% this week" color="#10B981" />
          <StatBlock icon={Clock} label="Avg Response" value="2.4m" sub="Faster than last week" color="#F59E0B" />
        </View>

        {/* Weekly chart */}
        <SectionHeader title="Messages This Week" icon={<TrendingUp size={12} color={C.dim} strokeWidth={2} />} />
        <Card style={{ padding: 18 }}>
          <BarChart />
        </Card>

        {/* Drill-down links */}
        <SectionHeader title="Detailed Reports" />
        <Card>
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push("/(drawer)/(tabs)/profile/analytics/messages" as any)}
          >
            <MessageSquare size={18} color={C.indigoL} strokeWidth={2} />
            <Text style={s.rowLabel}>Message Analytics</Text>
            <ChevronRight size={16} color={C.dim} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.row, s.rowBorder]}
            onPress={() => router.push("/(drawer)/(tabs)/profile/analytics/era" as any)}
          >
            <Sparkles size={18} color={C.pink} strokeWidth={2} />
            <Text style={s.rowLabel}>Era Usage Insights</Text>
            <ChevronRight size={16} color={C.dim} strokeWidth={2} />
          </TouchableOpacity>
        </Card>

        {/* Top contacts */}
        <SectionHeader title="Most Active Conversations" icon={<Users size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {[
            { name: "Alex Chen",   count: 84 },
            { name: "Design Team", count: 61 },
            { name: "Maya Patel",  count: 38 },
          ].map((c, i, arr) => (
            <View key={c.name} style={[s.contactRow, i < arr.length - 1 && s.rowBorder]}>
              <Text style={s.contactName}>{c.name}</Text>
              <Text style={s.contactCount}>{c.count} messages</Text>
            </View>
          ))}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  statsGrid: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rowLabel: { flex: 1, fontSize: 14, color: C.text, fontWeight: "500" },
  contactRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 13 },
  contactName: { fontSize: 14, color: C.text, fontWeight: "500" },
  contactCount: { fontSize: 13, color: C.muted },
});