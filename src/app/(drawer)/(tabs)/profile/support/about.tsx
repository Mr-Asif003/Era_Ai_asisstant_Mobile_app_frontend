import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Star, Link, Info, HelpCircle, AlertTriangle, Heart } from "lucide-react-native";
import { C, SubHeader, Card, SettingRow } from "../_shared";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="About Era Chat" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Logo */}
        <View style={{ alignItems: "center", paddingVertical: 32, gap: 12 }}>
          <LinearGradient
            colors={[C.indigoD, C.indigo]}
            style={{ width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 38, fontWeight: "700", color: "#fff" }}>E</Text>
          </LinearGradient>
          <Text style={{ fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 }}>Era Chat</Text>
          <Text style={{ fontSize: 13, color: C.muted }}>Version 1.0.0 (Build 1)</Text>
        </View>

        <Card>
          <SettingRow icon={<Star size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Rate Era Chat" onPress={() => Alert.alert("Rate Us", "Opening App Store…")} />
          <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Privacy Policy" onPress={() => Alert.alert("Privacy Policy", "Opening browser…")} />
          <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Terms of Service" onPress={() => Alert.alert("Terms", "Opening browser…")} />
          <SettingRow icon={<HelpCircle size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Help & Support" onPress={() => router.push("/(drawer)/(tabs)/profile/support" as any)} />
          <SettingRow icon={<AlertTriangle size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Open Source Licenses" onPress={() => Alert.alert("Licenses", "Open source licenses")} last />
        </Card>

        <View style={s.creditCard}>
          <Heart size={16} color={C.pink} strokeWidth={2} />
          <Text style={s.creditText}>
            Built with React Native, Expo, and Anthropic Claude — bringing AI agents to everyday conversations.
          </Text>
        </View>

        <Text style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 16 }}>
          Made with 🌸 by the Era Team
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  creditCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    margin: 16, backgroundColor: "rgba(244,114,182,0.06)", borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: "rgba(244,114,182,0.15)",
  },
  creditText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
});