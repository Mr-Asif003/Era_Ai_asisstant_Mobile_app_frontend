import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation, FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Check, QrCode } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { C, SubHeader } from "./_shared";

const AVATAR_GRADIENTS: [string, string][] = [
  ["#6366F1", "#8B5CF6"],
  ["#EC4899", "#F43F5E"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#DB2777", "#7C3AED"],
  ["#0EA5E9", "#6366F1"],
];

const EditField: React.FC<{
  label: string; value: string; onChange: (t: string) => void;
  placeholder: string; prefix?: string; multiline?: boolean; maxLength?: number;
}> = ({ label, value, onChange, placeholder, prefix, multiline, maxLength }) => {
  const borderAnim = useSharedValue(0);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(99,102,241,${interpolate(borderAnim.value, [0, 1], [0.08, 0.5], Extrapolation.CLAMP)})`,
  }));

  return (
    <View style={ef.wrap}>
      <Text style={ef.label}>{label}</Text>
      <Animated.View style={[ef.inputWrap, borderStyle]}>
        {prefix && <Text style={ef.prefix}>{prefix}</Text>}
        <TextInput
          style={[ef.input, multiline && ef.multiline]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          multiline={multiline}
          maxLength={maxLength}
          selectionColor={C.indigo}
          onFocus={() => { borderAnim.value = withTiming(1, { duration: 200 }); }}
          onBlur={() => { borderAnim.value = withTiming(0, { duration: 200 }); }}
        />
      </Animated.View>
    </View>
  );
};

const ef = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: C.muted, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.bg2,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 9, gap: 6,
  },
  prefix: { fontSize: 15, color: C.indigoL, fontWeight: "600" },
  input: { flex: 1, fontSize: 15, color: C.text },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState((user as any)?.bio ?? "");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    // TODO Phase 7: await userService.updateProfile({ displayName, username, bio })
    setIsSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Edit Profile" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Animated.View entering={FadeIn.duration(250)} style={ep.avatarSection}>
          <View style={ep.avatarWrap}>
            <LinearGradient colors={AVATAR_GRADIENTS[selectedGradient]} style={ep.avatar}>
              <Text style={ep.avatarInitial}>{displayName?.[0]?.toUpperCase() ?? "?"}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={ep.cameraBtn}
              onPress={() => router.push("/(drawer)/(tabs)/profile/avatar" as any)}
            >
              <Camera size={16} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={ep.avatarHint}>Tap to change photo</Text>

          <View style={ep.gradientRow}>
            {AVATAR_GRADIENTS.map((g, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedGradient(i)}
                style={[ep.gradientSwatch, selectedGradient === i && ep.swatchActive]}
              >
                <LinearGradient colors={g} style={ep.swatchGrad} />
                {selectedGradient === i && (
                  <View style={ep.swatchCheck}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 8 }}>
          <EditField label="Display Name" value={displayName} onChange={setDisplayName} placeholder="Your full name" maxLength={40} />
          <EditField label="Username" value={username} onChange={(t) => setUsername(t.replace(/\s/g, "").toLowerCase())} placeholder="your_username" prefix="@" maxLength={20} />
          <EditField label="Bio" value={bio} onChange={setBio} placeholder="Tell the world about yourself…" multiline maxLength={120} />

          <Text style={{ fontSize: 11, color: C.dim, textAlign: "right", marginTop: -8 }}>
            {bio.length}/120
          </Text>

          <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
            <LinearGradient colors={[C.indigoD, C.indigo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ep.saveBtn}>
              {isSaving ? (
                <Text style={ep.saveBtnText}>Saving…</Text>
              ) : (
                <>
                  <Check size={18} color="#fff" strokeWidth={2.5} />
                  <Text style={ep.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(drawer)/(tabs)/profile/qr" as any)}
            style={ep.qrLink}
          >
            <QrCode size={14} color={C.indigoL} strokeWidth={2} />
            <Text style={ep.qrLinkText}>Share my profile via QR code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ep = StyleSheet.create({
  avatarSection: { alignItems: "center", paddingVertical: 28, gap: 10 },
  avatarWrap: { position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 38, fontWeight: "700", color: "#fff" },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.indigo, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: C.bg0,
  },
  avatarHint: { fontSize: 13, color: C.muted },
  gradientRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  gradientSwatch: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", position: "relative" },
  swatchActive: { borderWidth: 2.5, borderColor: "#fff" },
  swatchGrad: { flex: 1 },
  swatchCheck: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16, marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  qrLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, paddingVertical: 8 },
  qrLinkText: { fontSize: 13, color: C.indigoL, fontWeight: "500" },
});