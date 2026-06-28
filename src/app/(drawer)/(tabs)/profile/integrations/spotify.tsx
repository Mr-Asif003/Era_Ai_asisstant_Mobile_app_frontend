import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Music, Check, Unplug, Sparkles, Volume2 } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function SpotifyIntegrationScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState({ voiceControl: true, autoPlayMood: false });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Spotify" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Music size={36} color="#1DB954" strokeWidth={1.5} />
          </View>
          <Text style={s.heroTitle}>Spotify</Text>
          <Text style={s.heroSub}>
            {connected
              ? "Connected — control playback by talking to Era"
              : 'Connect Spotify so you can say "Play something chill" to Era'}
          </Text>

          {connected ? (
            <View style={s.connectedPill}>
              <Check size={12} color={C.green} strokeWidth={3} />
              <Text style={s.connectedPillText}>your.email@gmail.com</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setConnected(true)} activeOpacity={0.85} style={{ width: "100%", marginTop: 12 }}>
              <LinearGradient colors={["#1DB954", "#168F40"]} style={s.connectBtn}>
                <Music size={18} color="#fff" strokeWidth={2} />
                <Text style={s.connectBtnText}>Connect Spotify</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {connected && (
          <>
            <SectionHeader title="Era Permissions" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
            <Card>
              <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#1DB954"
                label="Voice Playback Control" toggle toggleValue={settings.voiceControl} onToggle={() => toggle("voiceControl")} />
              <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
                label="Auto-Play Based on Mood" toggle toggleValue={settings.autoPlayMood} onToggle={() => toggle("autoPlayMood")} last />
            </Card>

            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <TouchableOpacity onPress={() => setConnected(false)} style={s.disconnectBtn}>
                <Unplug size={16} color={C.red} strokeWidth={2} />
                <Text style={s.disconnectText}>Disconnect Spotify</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: "center", padding: 24, gap: 8 },
  heroIcon: {
    width: 76, height: 76, borderRadius: 24, backgroundColor: "rgba(29,185,84,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  heroTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  heroSub: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 19, paddingHorizontal: 16 },
  connectedPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(34,197,94,0.1)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 12,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.25)",
  },
  connectedPillText: { fontSize: 13, color: C.green, fontWeight: "600" },
  connectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  connectBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, paddingVertical: 14,
  },
  disconnectText: { fontSize: 14, color: C.red, fontWeight: "600" },
});