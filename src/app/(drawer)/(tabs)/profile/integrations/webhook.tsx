import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Webhook, Plus, Trash2, Copy, Check, Code } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card } from "../_shared";

interface WebhookEntry {
  id: string;
  name: string;
  url: string;
  event: string;
  active: boolean;
}

const MOCK_WEBHOOKS: WebhookEntry[] = [
  { id: "w1", name: "New Message Logger", url: "https://api.myapp.com/hooks/messages", event: "message.created", active: true },
  { id: "w2", name: "Task Sync",           url: "https://api.myapp.com/hooks/tasks",    event: "task.completed",  active: false },
];

const WebhookRow: React.FC<{ item: WebhookEntry; onToggle: () => void; onDelete: () => void }> = ({ item, onToggle, onDelete }) => (
  <View style={wr.card}>
    <View style={wr.topRow}>
      <Text style={wr.name}>{item.name}</Text>
      <View style={[wr.statusDot, { backgroundColor: item.active ? C.green : C.dim }]} />
    </View>
    <Text style={wr.url} numberOfLines={1}>{item.url}</Text>
    <View style={wr.eventChip}>
      <Code size={10} color={C.indigoL} strokeWidth={2} />
      <Text style={wr.eventText}>{item.event}</Text>
    </View>
    <View style={wr.actions}>
      <TouchableOpacity onPress={onToggle} style={wr.actionBtn}>
        <Text style={[wr.actionText, { color: item.active ? C.amber : C.green }]}>
          {item.active ? "Pause" : "Activate"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={wr.actionBtn}>
        <Trash2 size={14} color={C.red} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  </View>
);

const wr = StyleSheet.create({
  card: {
    backgroundColor: C.bg1, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    padding: 14, marginHorizontal: 16, marginBottom: 10, gap: 6,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "700", color: C.text },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  url: { fontSize: 12, color: C.muted, fontFamily: "Courier" },
  eventChip: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  eventText: { fontSize: 11, color: C.indigoL, fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 4 },
  actionBtn: { paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: "700" },
});

export default function WebhookScreen() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const toggle = (id: string) => setWebhooks((p) => p.map((w) => w.id === id ? { ...w, active: !w.active } : w));
  const remove = (id: string) => setWebhooks((p) => p.filter((w) => w.id !== id));

  const create = () => {
    if (!name.trim() || !url.trim()) return;
    setWebhooks((p) => [
      ...p,
      { id: Date.now().toString(), name: name.trim(), url: url.trim(), event: "message.created", active: true },
    ]);
    setName(""); setUrl(""); setShowForm(false);
  };

  const apiKey = "era_sk_live_4f8a9b2c1d0e7f6a5b4c3d2e1f0a9b8c";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader
        title="Custom Webhooks"
        onBack={() => router.back()}
        rightAction={{ label: showForm ? "Cancel" : "New", onPress: () => setShowForm((v) => !v) }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Webhook size={32} color={C.indigoL} strokeWidth={1.5} />
          </View>
          <Text style={s.heroSub}>
            Power users can connect Era to their own tools and services using outgoing webhooks.
          </Text>
        </View>

        <SectionHeader title="Your API Key" />
        <Card style={{ padding: 16 }}>
          <Text style={s.apiKey} numberOfLines={1}>{apiKey}</Text>
          <TouchableOpacity
            style={s.copyBtn}
            onPress={() => Alert.alert("Copied", "API key copied to clipboard")}
          >
            <Copy size={13} color={C.indigoL} strokeWidth={2} />
            <Text style={s.copyText}>Copy Key</Text>
          </TouchableOpacity>
        </Card>

        {showForm && (
          <View style={{ marginHorizontal: 16, marginTop: 16, gap: 10 }}>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Webhook name"
              placeholderTextColor={C.dim}
            />
            <TextInput
              style={s.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://your-endpoint.com/webhook"
              placeholderTextColor={C.dim}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={create} activeOpacity={0.85}>
              <LinearGradient colors={[C.indigoD, C.indigo]} style={s.createBtn}>
                <Plus size={16} color="#fff" strokeWidth={2.5} />
                <Text style={s.createBtnText}>Create Webhook</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader title={`Active Webhooks (${webhooks.length})`} />
        {webhooks.map((w) => (
          <WebhookRow key={w.id} item={w} onToggle={() => toggle(w.id)} onDelete={() => remove(w.id)} />
        ))}
        {webhooks.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 40, gap: 8 }}>
            <Text style={{ color: C.muted, fontSize: 13 }}>No webhooks yet</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: "center", padding: 24, gap: 12 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  heroSub: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 19, paddingHorizontal: 20 },
  apiKey: { fontSize: 12, color: C.text, fontFamily: "Courier" },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, alignSelf: "flex-start" },
  copyText: { fontSize: 12, color: C.indigoL, fontWeight: "600" },
  input: {
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },
  createBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  createBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});