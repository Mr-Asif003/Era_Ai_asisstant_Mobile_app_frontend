import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bug, Camera, Send, AlertCircle } from "lucide-react-native";
import { C, SubHeader, SectionHeader } from "../_shared";

const SEVERITY = [
  { key: "low",      label: "Minor",     color: C.green },
  { key: "medium",   label: "Moderate",  color: C.amber },
  { key: "high",     label: "Severe",    color: C.red   },
] as const;

const CATEGORIES = ["Chat", "Era AI", "Voice", "Notifications", "Login/Auth", "Performance", "Other"];

export default function ReportBugScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<typeof SEVERITY[number]["key"]>("medium");
  const [category, setCategory] = useState("Chat");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    // TODO Phase 18: POST to bug-report backend endpoint with device/app diagnostics attached
    setSubmitted(true);
    setTimeout(() => router.back(), 1600);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0, alignItems: "center", justifyContent: "center", gap: 16 }}>
        <View style={s.successIcon}>
          <Bug size={32} color={C.green} strokeWidth={2} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: C.text }}>Report Submitted</Text>
        <Text style={{ fontSize: 13, color: C.muted, textAlign: "center", paddingHorizontal: 40 }}>
          Thanks for helping us improve Era Chat. We'll look into it.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Report a Bug" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.intro}>
          <Bug size={20} color={C.red} strokeWidth={2} />
          <Text style={s.introText}>
            Found something broken? Help us fix it by describing what happened.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <View>
            <Text style={s.label}>What went wrong?</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. App crashes when sending voice note"
              placeholderTextColor={C.dim}
            />
          </View>

          <View>
            <Text style={s.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[s.catPill, category === c && { backgroundColor: C.indigo, borderColor: C.indigo }]}
                >
                  <Text style={[s.catText, category === c && { color: "#fff" }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text style={s.label}>Severity</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {SEVERITY.map((sev) => (
                <TouchableOpacity
                  key={sev.key}
                  onPress={() => setSeverity(sev.key)}
                  style={[
                    s.sevPill,
                    severity === sev.key && { backgroundColor: `${sev.color}25`, borderColor: sev.color },
                  ]}
                >
                  <View style={[s.sevDot, { backgroundColor: sev.color }]} />
                  <Text style={[s.sevText, severity === sev.key && { color: sev.color }]}>{sev.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.label}>Steps to reproduce</Text>
            <TextInput
              style={[s.input, { minHeight: 120, textAlignVertical: "top" }]}
              value={description}
              onChangeText={setDescription}
              placeholder="1. Open a chat&#10;2. Hold mic to record voice note&#10;3. App crashes after 5 seconds"
              placeholderTextColor={C.dim}
              multiline
            />
          </View>

          <TouchableOpacity style={s.attachBtn}>
            <Camera size={16} color={C.indigoL} strokeWidth={2} />
            <Text style={s.attachText}>Attach Screenshot</Text>
          </TouchableOpacity>

          <View style={s.diagnosticNote}>
            <AlertCircle size={14} color={C.dim} strokeWidth={2} />
            <Text style={s.diagnosticText}>
              Device info and app version will be automatically attached.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[C.indigoD, C.indigo]} style={s.submitBtn}>
              <Send size={16} color="#fff" strokeWidth={2} />
              <Text style={s.submitText}>Submit Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  intro: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    margin: 16, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
  },
  introText: { flex: 1, fontSize: 13, color: C.muted, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: "600", color: C.muted, marginBottom: 8 },
  input: {
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  catText: { fontSize: 13, color: C.muted, fontWeight: "500" },
  sevPill: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  sevDot: { width: 8, height: 8, borderRadius: 4 },
  sevText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  attachBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: C.border, borderStyle: "dashed", borderRadius: 14, paddingVertical: 14,
  },
  attachText: { fontSize: 13, color: C.indigoL, fontWeight: "600" },
  diagnosticNote: { flexDirection: "row", gap: 6, alignItems: "center" },
  diagnosticText: { fontSize: 11, color: C.dim, flex: 1 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16, marginTop: 8,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  successIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center", justifyContent: "center",
  },
});