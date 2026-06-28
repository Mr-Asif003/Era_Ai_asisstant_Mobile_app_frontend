import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail, Calendar, FileText, MessageSquare, Music, Webhook, ChevronRight, Check, Plus,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader } from "../_shared";

interface Integration {
  key: string;
  label: string;
  description: string;
  icon: React.FC<any>;
  color: string;
  connected: boolean;
  detail?: string;
}

const INTEGRATIONS: Integration[] = [
  { key: "gmail",    label: "Gmail",            description: "Read, summarise, and send emails via Era", icon: Mail,         color: "#EA4335", connected: true,  detail: "12 unread" },
  { key: "calendar", label: "Google Calendar",  description: "Schedule meetings and get reminders",       icon: Calendar,     color: "#4285F4", connected: true,  detail: "3 events today" },
  { key: "notion",   label: "Notion",            description: "Create notes and pages from voice",         icon: FileText,     color: "#fff",    connected: false },
  { key: "slack",    label: "Slack",             description: "Read and send messages to your team",       icon: MessageSquare,color: "#4A154B", connected: false },
  { key: "spotify",  label: "Spotify",           description: "Control music playback with Era",           icon: Music,        color: "#1DB954", connected: false },
  { key: "webhook",  label: "Custom Webhook",    description: "Connect Era to your own tools",              icon: Webhook,      color: "#6366F1", connected: false },
];

const IntegrationCard: React.FC<{ item: Integration; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <View style={c.card}>
      <View style={[c.iconWrap, { backgroundColor: `${item.color}22` }]}>
        <item.icon size={22} color={item.color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={c.topRow}>
          <Text style={c.label}>{item.label}</Text>
          {item.connected && (
            <View style={c.connectedBadge}>
              <Check size={9} color="#fff" strokeWidth={3} />
              <Text style={c.connectedText}>Connected</Text>
            </View>
          )}
        </View>
        <Text style={c.desc} numberOfLines={1}>{item.description}</Text>
        {item.detail && <Text style={c.detail}>{item.detail}</Text>}
      </View>
      <ChevronRight size={16} color={C.dim} strokeWidth={2} />
    </View>
  </TouchableOpacity>
);

const c = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.bg1, borderRadius: 18, borderWidth: 1, borderColor: C.border,
    padding: 16, marginHorizontal: 16, marginBottom: 10,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 15, fontWeight: "700", color: C.text },
  connectedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  connectedText: { fontSize: 10, color: C.green, fontWeight: "700" },
  desc: { fontSize: 12, color: C.muted, marginTop: 2 },
  detail: { fontSize: 11, color: C.indigoL, fontWeight: "600", marginTop: 3 },
});

export default function IntegrationsHubScreen() {
  const router = useRouter();
  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Integrations" onBack={() => router.back()} />

      <View style={s.banner}>
        <LinearGradient colors={["rgba(99,102,241,0.15)", "rgba(139,92,246,0.1)"]} style={s.bannerInner}>
          <Text style={s.bannerCount}>{connectedCount}/{INTEGRATIONS.length}</Text>
          <Text style={s.bannerLabel}>apps connected to Era</Text>
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}>
        <SectionHeader title="All Integrations" />
        {INTEGRATIONS.map((item) => (
          <IntegrationCard
            key={item.key}
            item={item}
            onPress={() => router.push(`/(drawer)/(tabs)/profile/integrations/${item.key}` as any)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  banner: { paddingHorizontal: 16, paddingTop: 16 },
  bannerInner: {
    borderRadius: 18, padding: 18, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.25)",
  },
  bannerCount: { fontSize: 28, fontWeight: "800", color: C.indigoL },
  bannerLabel: { fontSize: 13, color: C.muted, marginTop: 2 },
});