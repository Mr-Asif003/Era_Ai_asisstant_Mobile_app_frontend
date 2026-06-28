import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, Trash2, Check } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { C, SubHeader } from "./_shared";

const GRADIENTS: [string, string][] = [
  ["#6366F1", "#8B5CF6"], ["#EC4899", "#F43F5E"], ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"], ["#DB2777", "#7C3AED"], ["#0EA5E9", "#6366F1"],
  ["#22D3EE", "#0EA5E9"], ["#A3E635", "#22C55E"], ["#FB923C", "#EF4444"],
];

export default function AvatarEditorScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selected, setSelected] = useState(0);
  const initial = user?.displayName?.[0]?.toUpperCase() ?? "A";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Profile Photo" onBack={() => router.back()} />

      <Animated.View entering={FadeIn.duration(250)} style={a.preview}>
        <LinearGradient colors={GRADIENTS[selected]} style={a.avatar}>
          <Text style={a.initial}>{initial}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Action buttons */}
      <View style={a.actionsRow}>
        <TouchableOpacity
          style={a.actionBtn}
          onPress={() => Alert.alert("Camera", "Camera capture coming in Phase 11 (Media & Files)")}
        >
          <View style={a.actionIcon}>
            <Camera size={20} color={C.indigoL} strokeWidth={2} />
          </View>
          <Text style={a.actionLabel}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={a.actionBtn}
          onPress={() => Alert.alert("Gallery", "Photo picker coming in Phase 11 (Media & Files)")}
        >
          <View style={a.actionIcon}>
            <ImageIcon size={20} color={C.indigoL} strokeWidth={2} />
          </View>
          <Text style={a.actionLabel}>Choose Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={a.actionBtn}
          onPress={() =>
            Alert.alert("Remove Photo", "Reset to default avatar?", [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: () => setSelected(0) },
            ])
          }
        >
          <View style={[a.actionIcon, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
            <Trash2 size={20} color={C.red} strokeWidth={2} />
          </View>
          <Text style={[a.actionLabel, { color: C.red }]}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Gradient swatches */}
      <Text style={a.sectionLabel}>Or pick a color gradient</Text>
      <View style={a.swatchGrid}>
        {GRADIENTS.map((g, i) => (
          <TouchableOpacity key={i} onPress={() => setSelected(i)} style={a.swatchWrap}>
            <LinearGradient colors={g} style={[a.swatch, selected === i && a.swatchActive]}>
              {selected === i && <Check size={16} color="#fff" strokeWidth={3} />}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <LinearGradient colors={[C.indigoD, C.indigo]} style={a.saveBtn}>
          <Check size={18} color="#fff" strokeWidth={2.5} />
          <Text style={a.saveBtnText}>Save Photo</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  preview: { alignItems: "center", paddingVertical: 32 },
  avatar: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "rgba(99,102,241,0.3)",
  },
  initial: { fontSize: 56, fontWeight: "700", color: "#fff" },
  actionsRow: { flexDirection: "row", justifyContent: "center", gap: 24, paddingHorizontal: 20, marginBottom: 24 },
  actionBtn: { alignItems: "center", gap: 8 },
  actionIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  actionLabel: { fontSize: 12, color: C.muted, fontWeight: "500" },
  sectionLabel: {
    fontSize: 12, fontWeight: "600", color: C.dim, letterSpacing: 0.5,
    textTransform: "uppercase", paddingHorizontal: 20, marginBottom: 12,
  },
  swatchGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, paddingHorizontal: 20 },
  swatchWrap: {},
  swatch: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  swatchActive: { borderWidth: 3, borderColor: "#fff" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});