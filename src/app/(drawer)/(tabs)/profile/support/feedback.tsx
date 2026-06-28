import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Lightbulb, Send, ThumbsUp, TrendingUp } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

const EXISTING_REQUESTS = [
  { id: "r1", title: "Dark mode scheduling (auto switch at sunset)", votes: 142, status: "planned" },
  { id: "r2", title: "Multi-language voice commands for Era",        votes: 98,  status: "in_progress" },
  { id: "r3", title: "Export chat history as PDF",                  votes: 76,  status: "considering" },
  { id: "r4", title: "Custom Era wake word (not just 'Hey Era')",    votes: 64,  status: "considering" },
  { id: "r5", title: "Widget for home screen quick reply",           votes: 51,  status: "planned" },
];

const STATUS_CONFIG = {
  planned:      { label: "Planned",      color: C.indigoL },
  in_progress:  { label: "In Progress",  color: C.amber    },
  considering:  { label: "Considering",  color: C.muted    },
};

export default function FeatureRequestScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleVote = (id: string) => setVotes((p) => ({ ...p, [id]: !p[id] }));

  const handleSubmit = () => {
    if (!title.trim()) return;
    // TODO Phase 18: POST to feature-request backend endpoint
    setSubmitted(true);
    setTitle(""); setDescription("");
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Feature Request" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.intro}>
          <Lightbulb size={20} color={C.amber} strokeWidth={2} />
          <Text style={s.introText}>
            Have an idea to make Era better? Share it below or vote on existing requests.
          </Text>
        </View>

        {/* Submit form */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What feature would you like to see?"
            placeholderTextColor={C.dim}
          />
          <TextInput
            style={[s.input, { minHeight: 90, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe how this would help you (optional)…"
            placeholderTextColor={C.dim}
            multiline
          />
          <TouchableOpacity onPress={handleSubmit} disabled={!title.trim()} activeOpacity={0.85}>
            <LinearGradient colors={[C.indigoD, C.indigo]} style={s.submitBtn}>
              <Send size={16} color="#fff" strokeWidth={2} />
              <Text style={s.submitText}>{submitted ? "Submitted! Thank you ✨" : "Submit Idea"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Existing requests */}
        <SectionHeader title="Popular Requests" icon={<TrendingUp size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {EXISTING_REQUESTS.map((req, i) => {
            const status = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
            const voted = votes[req.id];
            return (
              <View
                key={req.id}
                style={[s.reqRow, i < EXISTING_REQUESTS.length - 1 && s.rowBorder]}
              >
                <TouchableOpacity
                  onPress={() => toggleVote(req.id)}
                  style={[s.voteBtn, voted && s.voteBtnActive]}
                >
                  <ThumbsUp size={14} color={voted ? "#fff" : C.indigoL} strokeWidth={2} />
                  <Text style={[s.voteCount, voted && { color: "#fff" }]}>
                    {req.votes + (voted ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={s.reqTitle} numberOfLines={2}>{req.title}</Text>
                  <View style={[s.statusChip, { backgroundColor: `${status.color}18` }]}>
                    <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  intro: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    margin: 16, backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
  },
  introText: { flex: 1, fontSize: 13, color: C.muted, lineHeight: 19 },
  input: {
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  submitText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  reqRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingHorizontal: 20, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  voteBtn: {
    flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(99,102,241,0.25)",
  },
  voteBtnActive: { backgroundColor: C.indigo, borderColor: C.indigo },
  voteCount: { fontSize: 12, color: C.indigoL, fontWeight: "700" },
  reqTitle: { fontSize: 14, color: C.text, fontWeight: "500", lineHeight: 19, marginBottom: 6 },
  statusChip: { alignSelf: "flex-start", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
});