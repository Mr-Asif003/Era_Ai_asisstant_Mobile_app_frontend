import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Moon, Palette, Edit3, MessageSquare, Check } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, OptionRow } from "../_shared";

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [bubbleStyle, setBubbleStyle] = useState<"rounded" | "sharp">("rounded");
  const [accentColor, setAccentColor] = useState(0);

  const ACCENTS = [
    { color: "#6366F1", name: "Indigo" },
    { color: "#EC4899", name: "Pink" },
    { color: "#10B981", name: "Emerald" },
    { color: "#F59E0B", name: "Amber" },
    { color: "#0EA5E9", name: "Sky" },
    { color: "#8B5CF6", name: "Violet" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Appearance" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Theme" icon={<Moon size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <OptionRow label="🌙 Dark" selected={theme === "dark"} onPress={() => setTheme("dark")} />
          <OptionRow label="☀️ Light" selected={theme === "light"} onPress={() => setTheme("light")} />
          <OptionRow label="⚙️ System" selected={theme === "system"} onPress={() => setTheme("system")} last />
        </Card>

        <SectionHeader title="Accent Color" icon={<Palette size={12} color={C.dim} strokeWidth={2} />} />
        <Card style={{ padding: 16 }}>
          <View style={s.accentGrid}>
            {ACCENTS.map((a, i) => (
              <TouchableOpacity key={a.name} onPress={() => setAccentColor(i)} style={s.accentItem}>
                <View style={[s.accentDot, { backgroundColor: a.color }, accentColor === i && s.accentActive]}>
                  {accentColor === i && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={s.accentName}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <SectionHeader title="Font Size" icon={<Edit3 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <OptionRow label="Small" selected={fontSize === "small"} onPress={() => setFontSize("small")} />
          <OptionRow label="Medium" selected={fontSize === "medium"} onPress={() => setFontSize("medium")} />
          <OptionRow label="Large" selected={fontSize === "large"} onPress={() => setFontSize("large")} last />
        </Card>

        <SectionHeader title="Chat Bubbles" icon={<MessageSquare size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <OptionRow label="🫧 Rounded bubbles" selected={bubbleStyle === "rounded"} onPress={() => setBubbleStyle("rounded")} />
          <OptionRow label="▬ Sharp bubbles" selected={bubbleStyle === "sharp"} onPress={() => setBubbleStyle("sharp")} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  accentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-around" },
  accentItem: { alignItems: "center", gap: 6 },
  accentDot: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  accentActive: { borderWidth: 3, borderColor: "#fff" },
  accentName: { fontSize: 11, color: C.muted, fontWeight: "500" },
});