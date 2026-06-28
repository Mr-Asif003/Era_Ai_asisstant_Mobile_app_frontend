import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft, Check, Square, CheckSquare, Trash2,
  Edit3, Plus, Flag, Clock, Tag, Sparkles,
  ArrowUp, ArrowRight, ArrowDown, Circle,
} from "lucide-react-native";

const C = {
  bg0:"#0B0E1A",bg1:"#111827",bg2:"#1a2235",bg3:"#252D3D",
  indigo:"#6366F1",indigoD:"#4F46E5",indigoL:"#818CF8",
  text:"#F1F5F9",muted:"#94A3B8",dim:"#64748B",
  border:"rgba(255,255,255,0.06)",green:"#22C55E",
  amber:"#F59E0B",red:"#EF4444",pink:"#F472B6",violet:"#A78BFA",
};

const MOCK_DETAIL = {
  id: "t1",
  title: "Review Figma handoff for Project Alpha",
  description: "Go through all components in the Figma file, check spacing, verify token usage, and flag any inconsistencies with the existing component library. Leave comments directly in Figma.",
  priority: "high" as const,
  status: "in_progress" as const,
  dueDate: "Today 5:00 PM",
  tags: ["Design", "Urgent", "Alpha"],
  createdBy: "user" as const,
  createdAt: "Jan 15, 2024 9:00 AM",
  subtasks: [
    { id: "s1", title: "Check component library alignment",   done: true  },
    { id: "s2", title: "Review spacing tokens",               done: true  },
    { id: "s3", title: "Flag colour inconsistencies",         done: false },
    { id: "s4", title: "Leave Figma comments",                done: false },
    { id: "s5", title: "Share feedback with Maya",            done: false },
  ],
  activity: [
    { id: "a1", text: "Task created by you",                  time: "9:00 AM" },
    { id: "a2", text: "Priority set to High",                 time: "9:01 AM" },
    { id: "a3", text: "Subtask 'Check component library' done", time: "10:30 AM" },
    { id: "a4", text: "Status changed to In Progress",        time: "11:00 AM" },
  ],
};

const P_CONFIG = {
  high:   { color: C.red,   label: "High",   Icon: ArrowUp    },
  medium: { color: C.amber, label: "Medium", Icon: ArrowRight },
  low:    { color: C.green, label: "Low",    Icon: ArrowDown  },
};

const S_CONFIG = {
  todo:        { color: C.dim,   label: "To Do",       bg: C.bg3                    },
  in_progress: { color: C.amber, label: "In Progress", bg: "rgba(245,158,11,0.12)"  },
  done:        { color: C.green, label: "Done",        bg: "rgba(34,197,94,0.12)"   },
};

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router     = useRouter();

  // In production, fetch by taskId. Using mock here.
  const [task, setTask]     = useState(MOCK_DETAIL);
  const [newSub, setNewSub] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const toggleSub = (id: string) =>
    setTask((t) => ({
      ...t,
      subtasks: t.subtasks.map((s) =>
        s.id === id ? { ...s, done: !s.done } : s
      ),
    }));

  const addSub = () => {
    if (!newSub.trim()) return;
    setTask((t) => ({
      ...t,
      subtasks: [
        ...t.subtasks,
        { id: Date.now().toString(), title: newSub.trim(), done: false },
      ],
    }));
    setNewSub("");
  };

  const deleteSub = (id: string) =>
    setTask((t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== id) }));

  const saveTitle = () => {
    if (editTitle.trim()) setTask((t) => ({ ...t, title: editTitle.trim() }));
    setEditing(false);
  };

  const cycleStatus = () => {
    const order: typeof task.status[] = ["todo", "in_progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    setTask((t) => ({ ...t, status: next }));
  };

  const done      = task.subtasks.filter((s) => s.done).length;
  const total     = task.subtasks.length;
  const progress  = total > 0 ? (done / total) * 100 : 0;
  const pc        = P_CONFIG[task.priority];
  const sc        = S_CONFIG[task.status];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Task Detail</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete Task", "Remove this task permanently?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => router.back() },
            ])
          }
        >
          <Trash2 size={18} color={C.red} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Title card ── */}
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={s.card}>
            {/* Status + priority row */}
            <View style={s.badgeRow}>
              <TouchableOpacity
                style={[s.statusBadge, { backgroundColor: sc.bg }]}
                onPress={cycleStatus}
              >
                <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
              </TouchableOpacity>
              <View style={[s.priorityBadge, { backgroundColor: `${pc.color}18` }]}>
                <pc.Icon size={12} color={pc.color} strokeWidth={2.5} />
                <Text style={[s.priorityText, { color: pc.color }]}>{pc.label} Priority</Text>
              </View>
              {task.createdBy === "era" && (
                <View style={s.eraBadge}>
                  <Sparkles size={10} color={C.pink} strokeWidth={2} />
                  <Text style={s.eraText}>Era</Text>
                </View>
              )}
            </View>

            {/* Title */}
            {editing ? (
              <TextInput
                style={s.titleInput}
                value={editTitle}
                onChangeText={setEditTitle}
                onBlur={saveTitle}
                autoFocus
                multiline
                selectionColor={C.indigo}
              />
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={s.title}>{task.title}</Text>
              </TouchableOpacity>
            )}

            {/* Description */}
            {task.description && (
              <Text style={s.desc}>{task.description}</Text>
            )}

            {/* Meta */}
            <View style={s.metaGrid}>
              <View style={s.metaItem}>
                <Clock size={13} color={C.amber} strokeWidth={2} />
                <Text style={s.metaLabel}>Due</Text>
                <Text style={[s.metaValue, { color: C.amber }]}>{task.dueDate}</Text>
              </View>
              <View style={s.metaItem}>
                <Flag size={13} color={C.dim} strokeWidth={2} />
                <Text style={s.metaLabel}>Created</Text>
                <Text style={s.metaValue}>{task.createdAt}</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={s.tagsRow}>
              {task.tags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Progress ── */}
        <Animated.View entering={FadeIn.delay(80).duration(300)}>
          <View style={s.card}>
            <View style={s.progressHeader}>
              <Text style={s.sectionTitle}>Progress</Text>
              <Text style={[s.progressCount, { color: C.indigo }]}>{done}/{total} subtasks</Text>
            </View>
            <View style={s.progressBarBg}>
              <LinearGradient
                colors={[C.indigoD, C.indigo]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progressBarFill, { width: `${progress}%` as any }]}
              />
            </View>
            <Text style={s.progressPct}>{Math.round(progress)}% complete</Text>
          </View>
        </Animated.View>

        {/* ── Subtasks ── */}
        <Animated.View entering={FadeIn.delay(140).duration(300)}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>Subtasks</Text>
            <View style={{ gap: 4, marginTop: 8 }}>
              {task.subtasks.map((sub) => (
                <View key={sub.id} style={s.subRow}>
                  <TouchableOpacity onPress={() => toggleSub(sub.id)}>
                    {sub.done ? (
                      <LinearGradient colors={[C.green, "#059669"]} style={s.subCheck}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </LinearGradient>
                    ) : (
                      <View style={s.subUncheck} />
                    )}
                  </TouchableOpacity>
                  <Text style={[s.subTitle, sub.done && s.subTitleDone]} numberOfLines={1}>
                    {sub.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteSub(sub.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={12} color={C.dim} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add subtask */}
            <View style={s.addSubRow}>
              <TextInput
                style={s.addSubInput}
                value={newSub}
                onChangeText={setNewSub}
                placeholder="Add a subtask…"
                placeholderTextColor={C.dim}
                onSubmitEditing={addSub}
                returnKeyType="done"
                selectionColor={C.indigo}
              />
              <TouchableOpacity
                onPress={addSub}
                style={s.addSubBtn}
                disabled={!newSub.trim()}
              >
                <Plus size={16} color={newSub.trim() ? "#fff" : C.dim} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ── Activity log ── */}
        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>Activity</Text>
            <View style={{ gap: 0, marginTop: 8 }}>
              {task.activity.map((a, i) => (
                <View key={a.id} style={s.activityRow}>
                  <View style={s.activityDot} />
                  {i < task.activity.length - 1 && <View style={s.activityLine} />}
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityText}>{a.text}</Text>
                    <Text style={s.activityTime}>{a.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Complete button ── */}
        {task.status !== "done" && (
          <Animated.View entering={FadeIn.delay(260).duration(300)}>
            <TouchableOpacity
              onPress={() => setTask((t) => ({ ...t, status: "done" }))}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.green, "#059669"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.completeBtn}
              >
                <CheckSquare size={20} color="#fff" strokeWidth={2} />
                <Text style={s.completeBtnText}>Mark as Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  card: {
    backgroundColor: C.bg1, borderRadius: 20, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: "700" },
  priorityBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  priorityText: { fontSize: 12, fontWeight: "700" },
  eraBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(244,114,182,0.12)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  eraText: { fontSize: 12, color: C.pink, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "700", color: C.text, lineHeight: 28, letterSpacing: -0.3 },
  titleInput: {
    fontSize: 20, fontWeight: "700", color: C.text, lineHeight: 28,
    borderBottomWidth: 1, borderBottomColor: C.indigo, paddingBottom: 4,
  },
  desc: { fontSize: 14, color: C.muted, lineHeight: 21, marginTop: 10 },
  metaGrid: { flexDirection: "row", gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  metaItem: { gap: 4 },
  metaLabel: { fontSize: 11, color: C.dim, fontWeight: "600", letterSpacing: 0.3 },
  metaValue: { fontSize: 13, color: C.text, fontWeight: "600" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: { backgroundColor: "rgba(99,102,241,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: 12, color: C.indigoL, fontWeight: "500" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: C.text, letterSpacing: -0.2 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressCount: { fontSize: 14, fontWeight: "700" },
  progressBarBg: { height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: 12, color: C.muted, marginTop: 6 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  subCheck: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  subUncheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.dim },
  subTitle: { flex: 1, fontSize: 14, color: C.text, fontWeight: "500" },
  subTitleDone: { textDecorationLine: "line-through", color: C.muted },
  addSubRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  addSubInput: {
    flex: 1, backgroundColor: C.bg2, borderRadius: 12, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: C.text,
  },
  addSubBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: C.indigo, alignItems: "center", justifyContent: "center",
  },
  activityRow: { flexDirection: "row", gap: 12, paddingVertical: 8, position: "relative" },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.indigo, marginTop: 4, flexShrink: 0 },
  activityLine: { position: "absolute", left: 3.5, top: 20, width: 1, height: "100%", backgroundColor: C.border },
  activityText: { fontSize: 13, color: C.muted },
  activityTime: { fontSize: 11, color: C.dim, marginTop: 2 },
  completeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  completeBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});