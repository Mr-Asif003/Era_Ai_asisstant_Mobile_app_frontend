import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  HardDrive, MessageSquare, Mic, Image as ImageIcon, FileText, Trash2, Wifi,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

const STORAGE_BREAKDOWN = [
  { label: "Messages",    size: "320 MB", percent: 27, color: "#6366F1", icon: MessageSquare },
  { label: "Voice Notes", size: "480 MB", percent: 40, color: "#F472B6", icon: Mic           },
  { label: "Photos",      size: "280 MB", percent: 23, color: "#10B981", icon: ImageIcon      },
  { label: "Files",       size: "120 MB", percent: 10, color: "#F59E0B", icon: FileText        },
];

export default function StorageSettingsScreen() {
  const router = useRouter();
  const total = "1.2 GB";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Storage & Data" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Total usage card */}
        <View style={s.totalCard}>
          <HardDrive size={28} color={C.indigoL} strokeWidth={1.5} />
          <Text style={s.totalValue}>{total}</Text>
          <Text style={s.totalLabel}>Total storage used</Text>

          {/* Stacked bar */}
          <View style={s.barWrap}>
            {STORAGE_BREAKDOWN.map((item) => (
              <View
                key={item.label}
                style={[s.barSegment, { width: `${item.percent}%`, backgroundColor: item.color }]}
              />
            ))}
          </View>
        </View>

        <SectionHeader title="Breakdown" />
        <Card>
          {STORAGE_BREAKDOWN.map((item, i) => (
            <SettingRow
              key={item.label}
              icon={<item.icon size={18} color="#fff" strokeWidth={2} />}
              iconBg={item.color}
              label={item.label}
              value={item.size}
              last={i === STORAGE_BREAKDOWN.length - 1}
            />
          ))}
        </Card>

        <SectionHeader title="Network" icon={<Wifi size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Wifi size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Wi-Fi Only Downloads" onPress={() => Alert.alert("Wi-Fi Only", "Toggle in network preferences")} last />
        </Card>

        <SectionHeader title="Cleanup" icon={<Trash2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Clear Media Cache" danger
            onPress={() => Alert.alert("Clear Cache", "Free up 480 MB of cached media?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => {} },
            ])} />
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Delete Old Voice Notes" danger
            onPress={() => Alert.alert("Delete Voice Notes", "Remove voice notes older than 30 days?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => {} },
            ])} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  totalCard: {
    margin: 16, backgroundColor: C.bg1, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, padding: 24,
    alignItems: "center", gap: 6,
  },
  totalValue: { fontSize: 28, fontWeight: "700", color: C.text, marginTop: 8 },
  totalLabel: { fontSize: 13, color: C.muted },
  barWrap: {
    flexDirection: "row", width: "100%", height: 8, borderRadius: 4,
    overflow: "hidden", marginTop: 16, backgroundColor: C.bg3,
  },
  barSegment: { height: 8 },
});