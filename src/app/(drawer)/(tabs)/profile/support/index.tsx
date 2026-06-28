import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search, Info, Bug, Lightbulb, MessageSquare, Sparkles,
  Shield, Mic, ChevronRight, ChevronDown, Mail,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

const FAQS = [
  {
    q: "How do I activate Era with my voice?",
    a: 'Just say "Hey Era" from anywhere in the app, or tap the mic button on the Era tab. Make sure microphone permissions are enabled in your device settings.',
  },
  {
    q: "Can I use Era without an internet connection?",
    a: "Era requires an internet connection for AI processing and tool calls like Gmail or Calendar. Basic chat messaging works offline and syncs when you reconnect.",
  },
  {
    q: "How do I connect my Gmail account?",
    a: "Go to Space → Integrations → Gmail and tap Connect. You'll be redirected to Google's secure sign-in page to authorize access.",
  },
  {
    q: "Is my data encrypted?",
    a: "Yes. Messages are protected with end-to-end encryption. Era's AI processing happens through secure, audited API calls and is never stored without your consent.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Space → Privacy & Security → Delete Account. This action is permanent and removes all your data within 24 hours.",
  },
];

const FaqRow: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity onPress={() => setOpen((v) => !v)} activeOpacity={0.8}>
      <View style={faq.row}>
        <View style={faq.topRow}>
          <Text style={faq.question}>{q}</Text>
          <ChevronDown
            size={16}
            color={C.dim}
            strokeWidth={2}
            style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
          />
        </View>
        {open && <Text style={faq.answer}>{a}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const faq = StyleSheet.create({
  row: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  question: { flex: 1, fontSize: 14, color: C.text, fontWeight: "600" },
  answer: { fontSize: 13, color: C.muted, lineHeight: 20, marginTop: 8 },
});

export default function SupportHomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Help Center" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.searchWrap}>
          <Search size={15} color={C.dim} strokeWidth={2} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search for help…"
            placeholderTextColor={C.dim}
          />
        </View>

        {/* Quick actions */}
        <View style={s.quickRow}>
          {[
            { icon: Bug, label: "Report Bug", route: "/(drawer)/(tabs)/profile/support/bug", color: C.red },
            { icon: Lightbulb, label: "Feedback", route: "/(drawer)/(tabs)/profile/support/feedback", color: C.amber },
            { icon: Info, label: "About", route: "/(drawer)/(tabs)/profile/support/about", color: C.indigoL },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.quickCard}
              onPress={() => router.push(item.route as any)}
            >
              <item.icon size={20} color={item.color} strokeWidth={2} />
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topics */}
        <SectionHeader title="Browse Topics" />
        <Card>
          {[
            { icon: Sparkles, label: "Using Era AI", color: C.pink },
            { icon: MessageSquare, label: "Messaging & Chats", color: C.indigo },
            { icon: Mic, label: "Voice Commands", color: "#10B981" },
            { icon: Shield, label: "Privacy & Security", color: "#F59E0B" },
          ].map((topic, i, arr) => (
            <TouchableOpacity key={topic.label} style={[s.topicRow, i < arr.length - 1 && s.rowBorder]}>
              <topic.icon size={18} color={topic.color} strokeWidth={2} />
              <Text style={s.topicLabel}>{topic.label}</Text>
              <ChevronRight size={16} color={C.dim} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* FAQ */}
        <SectionHeader title="Frequently Asked Questions" />
        <Card>
          {filtered.map((f) => (
            <FaqRow key={f.q} q={f.q} a={f.a} />
          ))}
          {filtered.length === 0 && (
            <Text style={{ color: C.muted, fontSize: 13, padding: 20, textAlign: "center" }}>
              No results found
            </Text>
          )}
        </Card>

        {/* Contact */}
        <View style={s.contactCard}>
          <Mail size={18} color={C.indigoL} strokeWidth={2} />
          <Text style={s.contactText}>
            Still need help? Email us at{" "}
            <Text style={{ color: C.indigoL, fontWeight: "600" }}>support@erachat.app</Text>
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.bg2, borderRadius: 14, marginHorizontal: 16,
    paddingHorizontal: 14, paddingVertical: 12, marginTop: 12, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  quickRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  quickCard: {
    flex: 1, alignItems: "center", gap: 8, backgroundColor: C.bg1,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingVertical: 16,
  },
  quickLabel: { fontSize: 11, color: C.muted, fontWeight: "600" },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  topicLabel: { flex: 1, fontSize: 14, color: C.text, fontWeight: "500" },
  contactCard: {
    flexDirection: "row", gap: 10, alignItems: "center", margin: 16,
    backgroundColor: "rgba(99,102,241,0.08)", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.2)",
  },
  contactText: { flex: 1, fontSize: 13, color: C.muted, lineHeight: 19 },
});