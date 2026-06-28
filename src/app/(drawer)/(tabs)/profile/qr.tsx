import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Share2, Copy, RefreshCw, Scan } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { C, SubHeader } from "./_shared";

// Simple QR-pattern placeholder (production: use react-native-qrcode-svg)
const QRPattern: React.FC<{ size: number }> = ({ size }) => {
  const cells = 7;
  const cellSize = size / cells;
  // Deterministic pseudo-random pattern based on a seed, just for visual placeholder
  const seed = 42;
  const pattern = Array.from({ length: cells * cells }, (_, i) => {
    const x = (i * 7 + seed) % 13;
    return x < 6;
  });

  return (
    <View style={{ width: size, height: size, flexDirection: "row", flexWrap: "wrap" }}>
      {pattern.map((filled, i) => (
        <View
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: filled ? "#0B0E1A" : "transparent",
          }}
        />
      ))}
    </View>
  );
};

export default function QrCodeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const glow = useSharedValue(0.4);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1800 }), withTiming(0.4, { duration: 1800 })),
      -1, true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const username = user?.username ?? "asifkhan";
  const profileLink = `https://erachat.app/u/${username}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Add me on Era Chat: ${profileLink}`,
        url: profileLink,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="My QR Code" onBack={() => router.back()} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        {/* Glow */}
        <Animated.View style={[q.glow, glowStyle]} />

        <Animated.View entering={FadeIn.duration(300)} style={q.card}>
          <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={q.avatar}>
            <Text style={q.avatarText}>{user?.displayName?.[0]?.toUpperCase() ?? "A"}</Text>
          </LinearGradient>

          <Text style={q.name}>{user?.displayName ?? "Asif Khan"}</Text>
          <Text style={q.username}>@{username}</Text>

          <View style={q.qrWrap}>
            <QRPattern size={180} />
          </View>

          <Text style={q.hint}>Scan to add on Era Chat</Text>
        </Animated.View>

        <View style={q.actionsRow}>
          <TouchableOpacity style={q.actionBtn} onPress={handleShare}>
            <Share2 size={18} color={C.indigoL} strokeWidth={2} />
            <Text style={q.actionLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={q.actionBtn}>
            <Copy size={18} color={C.indigoL} strokeWidth={2} />
            <Text style={q.actionLabel}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={q.actionBtn}>
            <RefreshCw size={18} color={C.indigoL} strokeWidth={2} />
            <Text style={q.actionLabel}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={q.scanBtn} activeOpacity={0.85}>
          <LinearGradient colors={[C.indigoD, C.indigo]} style={q.scanGrad}>
            <Scan size={18} color="#fff" strokeWidth={2} />
            <Text style={q.scanText}>Scan Someone's Code</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const q = StyleSheet.create({
  glow: {
    position: "absolute",
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  name: { fontSize: 18, fontWeight: "700", color: "#0B0E1A" },
  username: { fontSize: 13, color: "#6366F1", fontWeight: "500", marginBottom: 12 },
  qrWrap: { padding: 12, backgroundColor: "#fff", borderRadius: 16 },
  hint: { fontSize: 12, color: "#64748B", marginTop: 12 },
  actionsRow: { flexDirection: "row", gap: 28, marginTop: 32 },
  actionBtn: { alignItems: "center", gap: 6 },
  actionLabel: { fontSize: 12, color: C.muted, fontWeight: "500" },
  scanBtn: { width: "100%", marginTop: 24 },
  scanGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 15,
  },
  scanText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});