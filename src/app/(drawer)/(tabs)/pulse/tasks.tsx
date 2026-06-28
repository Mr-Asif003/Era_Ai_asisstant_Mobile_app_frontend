import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, withSequence, FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckSquare, Square, Plus, Trash2, ChevronLeft,
  ChevronRight, Flag, Sparkles, Edit3, Circle,
  ArrowUp, ArrowRight, ArrowDown, Filter,
} from "lucide-react-native";

const C = {
  bg0:"#0B0E1A",bg1:"#111827",bg2:"#1a2235",bg3:"#252D3D",
  indigo:"#6366F1",indigoD:"#4F46E5",indigoL:"#818CF8",
  text:"#F1F5F9",muted:"#94A3B8",dim:"#64748B",
  border:"rgba(255,255,255,0.06)",green:"#22C55E",
  amber:"#F59E0B",red:"#EF4444",pink:"#F472B6",violet:"#A78BFA",
};

type Priority = "high" | "medium" | "low";
type Status   = "todo" | "in_progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  tags: string[];
  createdBy: "user" | "era";
  subtasks?: { id: string; title: string; done: boolean }[];
}

const MOCK_TASKS: Task[] = [
  {
    id: "t1", title: "Review Figma handoff for Project Alpha",
    description: "Go through all components, check spacing, flag any inconsistencies.",
    priority: "high", status: "todo", dueDate: "Today 5:00 PM",
    tags: ["Design", "Urgent"], createdBy: "user",
    subtasks: [
      { id: "s1", title: "Check component library", done: true  },
      { id: "s2", title: "Review spacing tokens",   done: false },
      { id: "s3", title: "Flag inconsistencies",    done: false },
    ],
  },
  {
    id: "t2", title: "Reply to Alex about project deadline",
    priority: "high", status: "in_progress", dueDate: "Today 3:00 PM",
    tags: ["Communication"], createdBy: "era",
  },
  {
    id: "t3", title: "Prepare standup notes for Thursday",
    priority: "medium", status: "todo", dueDate: "Tomorrow",
    tags: ["Team"], createdBy: "user",
  },
  {
    id: "t4", title: "Draft proposal for new client",
    description: "Include timeline, budget estimate, and team structure.",
    priority: "medium", status: "todo", dueDate: "Mon, Jan 20",
    tags: ["Business"], createdBy: "user",
    subtasks: [
      { id: "s4", title: "Research client background", done: true  },
      { id: "s5", title: "Write timeline section",     done: false },
      { id: "s6", title: "Add budget estimates",       done: false },
    ],
  },
  {
    id: "t5", title: "Update personal website portfolio",
    priority: "low", status: "todo", dueDate: "This week",
    tags: ["Personal"], createdBy: "user",
  },
  {
    id: "t6", title: "Send project summary to Sam",
    priority: "low", status: "done", dueDate: "Yesterday",
    tags: ["Communication"], createdBy: "era",
  },
];

// ─── Priority config ───────────────────────────────────────────────────────────
const P_CONFIG = {
  high:   { color: C.red,   bg: "rgba(239,68,68,0.12)",  label: "High",   Icon: ArrowUp    },
  medium: { color: C.amber, bg: "rgba(245,158,11,0.12)", label: "Medium", Icon: ArrowRight },
  low:    { color: C.green, bg: "rgba(34,197,94,0.12)",  label: "Low",    Icon: ArrowDown  },
};

const S_CONFIG = {
  todo:        { color: C.dim,    label: "To Do",       bg: C.bg3                        },
  in_progress: { color: C.amber,  label: "In Progress", bg: "rgba(245,158,11,0.12)"     },
  done:        { color: C.green,  label: "Done",        bg: "rgba(34,197,94,0.12)"      },
};

// ─── Subtask progress bar ──────────────────────────────────────────────────────
const SubtaskProgress: React.FC<{ subtasks: Task["subtasks"] }> = ({ subtasks }) => {
  if (!subtasks?.length) return null;
  const done  = subtasks.filter((s) => s.done).length;
  const total = subtasks.length;
  const pct   = (done / total) * 100;

  return (
    <View style={sp.wrap}>
      <View style={sp.barBg}>
        <View style={[sp.barFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={sp.label}>{done}/{total}</Text>
    </View>
  );
};

const sp = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  barBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.bg3 },
  barFill: { height: 4, borderRadius: 2, backgroundColor: C.indigo },
  label: { fontSize: 10, color: C.muted, fontWeight: "600", minWidth: 28 },
});

// ─── Task card ─────────────────────────────────────────────────────────────────
const TaskCard: React.FC<{
  task: Task;
  index: number;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ task, index, onPress, onToggle, onDelete }) => {
  const o = useSharedValue(0);
  const y = useSharedValue(14);
  const scale = useSharedValue(1);

  useEffect(() => {
    o.value = withDelay(index * 55, withTiming(1, { duration: 350 }));
    y.value = withDelay(index * 55, withSpring(0, { damping: 14 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  const pc = P_CONFIG[task.priority];
  const sc = S_CONFIG[task.status];
  const isDone = task.status === "done";

  return (
    <Animated.View style={[cardStyle, { marginHorizontal: 16, marginBottom: 10 }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.985, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={1}
      >
        <View style={[tc.card, isDone && tc.cardDone]}>
          <View style={tc.inner}>
            {/* Check circle */}
            <TouchableOpacity onPress={onToggle} style={tc.checkWrap}>
              {isDone ? (
                <LinearGradient colors={[C.green, "#059669"]} style={tc.checkFilled}>
                  <CheckSquare size={14} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              ) : (
                <View style={[tc.checkEmpty, { borderColor: pc.color }]} />
              )}
            </TouchableOpacity>

            {/* Content */}
            <View style={tc.content}>
              <View style={tc.topRow}>
                <Text style={[tc.title, isDone && tc.titleDone]} numberOfLines={1}>
                  {task.title}
                </Text>
                {task.createdBy === "era" && (
                  <View style={tc.eraBadge}>
                    <Sparkles size={9} color={C.pink} strokeWidth={2} />
                    <Text style={tc.eraText}>Era</Text>
                  </View>
                )}
              </View>

              {task.description && (
                <Text style={tc.desc} numberOfLines={1}>{task.description}</Text>
              )}

              <SubtaskProgress subtasks={task.subtasks} />

              <View style={tc.metaRow}>
                {/* Priority */}
                <View style={[tc.chip, { backgroundColor: pc.bg }]}>
                  <pc.Icon size={9} color={pc.color} strokeWidth={2.5} />
                  <Text style={[tc.chipText, { color: pc.color }]}>{pc.label}</Text>
                </View>

                {/* Status */}
                <View style={[tc.chip, { backgroundColor: sc.bg }]}>
                  <Text style={[tc.chipText, { color: sc.color }]}>{sc.label}</Text>
                </View>

                {/* Due date */}
                {task.dueDate && (
                  <Text style={tc.due}>{task.dueDate}</Text>
                )}
              </View>

              {/* Tags */}
              {task.tags.length > 0 && (
                <View style={tc.tagsRow}>
                  {task.tags.map((tag) => (
                    <View key={tag} style={tc.tag}>
                      <Text style={tc.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={tc.actions}>
              <TouchableOpacity
                onPress={onDelete}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={14} color={C.dim} strokeWidth={2} />
              </TouchableOpacity>
              <ChevronRight size={14} color={C.dim} strokeWidth={2} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const tc = StyleSheet.create({
  card: {
    backgroundColor: C.bg1, borderRadius: 18, borderWidth: 1,
    borderColor: C.border, overflow: "hidden",
  },
  cardDone: { opacity: 0.55 },
  inner: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  checkWrap: { marginTop: 2, flexShrink: 0 },
  checkFilled: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  checkEmpty: { width: 26, height: 26, borderRadius: 8, borderWidth: 2 },
  content: { flex: 1, gap: 5 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 15, fontWeight: "600", color: C.text, flex: 1 },
  titleDone: { textDecorationLine: "line-through", color: C.muted },
  desc: { fontSize: 12, color: C.muted, lineHeight: 17 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  chipText: { fontSize: 10, fontWeight: "700" },
  due: { fontSize: 11, color: C.amber, fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { backgroundColor: "rgba(99,102,241,0.1)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, color: C.indigoL, fontWeight: "500" },
  eraBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(244,114,182,0.1)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  eraText: { fontSize: 9, color: C.pink, fontWeight: "700" },
  actions: { gap: 12, alignItems: "center" },
});

// ─── Create Task Modal ─────────────────────────────────────────────────────────
const CreateTaskModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreate: (t: Task) => void;
}> = ({ visible, onClose, onCreate }) => {
  const [title, setTitle]       = useState("");
  const [desc,  setDesc]        = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate]   = useState("Today");
  const [tag, setTag]           = useState("");
  const [tags, setTags]         = useState<string[]>([]);

  const addTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags((p) => [...p, tag.trim()]);
      setTag("");
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      id: Date.now().toString(),
      title: title.trim(),
      description: desc.trim() || undefined,
      priority, status: "todo",
      dueDate: dueDate || undefined,
      tags, createdBy: "user",
    });
    setTitle(""); setDesc(""); setPriority("medium");
    setDueDate("Today"); setTags([]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ctm.backdrop} activeOpacity={1} onPress={onClose} />
      <ScrollView style={ctm.sheet} keyboardShouldPersistTaps="handled">
        <View style={ctm.handle} />
        <Text style={ctm.title}>New Task</Text>

        <TextInput
          style={ctm.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={C.dim}
          autoFocus
        />

        <TextInput
          style={[ctm.input, { minHeight: 72, textAlignVertical: "top" }]}
          value={desc}
          onChangeText={setDesc}
          placeholder="Add a description (optional)…"
          placeholderTextColor={C.dim}
          multiline
        />

        <Text style={ctm.label}>Priority</Text>
        <View style={ctm.pillRow}>
          {(["high","medium","low"] as Priority[]).map((p) => {
            const pc = P_CONFIG[p];
            return (
              <TouchableOpacity
                key={p}
                style={[ctm.pill, priority === p && { backgroundColor: pc.color, borderColor: pc.color }]}
                onPress={() => setPriority(p)}
              >
                <pc.Icon size={12} color={priority === p ? "#fff" : pc.color} strokeWidth={2} />
                <Text style={[ctm.pillText, priority === p && { color: "#fff" }]}>{pc.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={ctm.label}>Due Date</Text>
        <TextInput
          style={ctm.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="e.g. Today, Tomorrow, Mon Jan 20"
          placeholderTextColor={C.dim}
        />

        <Text style={ctm.label}>Tags</Text>
        <View style={ctm.tagInputRow}>
          <TextInput
            style={[ctm.input, { flex: 1 }]}
            value={tag}
            onChangeText={setTag}
            placeholder="Add a tag…"
            placeholderTextColor={C.dim}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={ctm.addTagBtn} onPress={addTag}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={ctm.tagsRow}>
            {tags.map((t) => (
              <TouchableOpacity
                key={t}
                style={ctm.tagChip}
                onPress={() => setTags((p) => p.filter((x) => x !== t))}
              >
                <Text style={ctm.tagChipText}>#{t} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={handleCreate} disabled={!title.trim()} activeOpacity={0.85}>
          <LinearGradient
            colors={[C.indigoD, C.indigo]}
            start={{ x:0,y:0 }} end={{ x:1,y:0 }}
            style={ctm.createBtn}
          >
            <CheckSquare size={18} color="#fff" strokeWidth={2} />
            <Text style={ctm.createText}>Create Task</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Modal>
  );
};

const ctm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: C.bg1, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, borderWidth: 1, borderBottomWidth: 0, borderColor: C.border,
    maxHeight: "90%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.dim, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: C.text, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: C.muted, marginBottom: 8, marginTop: 4, letterSpacing: 0.3 },
  input: {
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, marginBottom: 12,
  },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  pill: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 9, borderRadius: 12,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  pillText: { fontSize: 13, fontWeight: "600", color: C.muted },
  tagInputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  addTagBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: C.indigo, alignItems: "center", justifyContent: "center",
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  tagChip: {
    backgroundColor: "rgba(99,102,241,0.15)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  tagChipText: { fontSize: 12, color: C.indigoL, fontWeight: "600" },
  createBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 15, marginTop: 8,
  },
  createText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

// ─── Main Tasks Screen ─────────────────────────────────────────────────────────
export default function TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks]         = useState(MOCK_TASKS);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatus] = useState<"all"|Status>("all");
  const [sortBy, setSortBy]       = useState<"priority"|"date">("priority");

  const toggle = (id: string) =>
    setTasks((p) => p.map((t) =>
      t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
    ));
  const remove  = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));
  const create  = (t: Task)    => setTasks((p) => [t, ...p]);

  const displayed = tasks
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  const counts = {
    all:         tasks.length,
    todo:        tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      {/* Header */}
      <View style={th.header}>
        <TouchableOpacity onPress={() => router.back()} style={th.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={th.title}>Tasks</Text>
        <TouchableOpacity
          onPress={() => setSortBy((s) => s === "priority" ? "date" : "priority")}
          style={th.sortBtn}
        >
          <Filter size={16} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Status filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={th.filterRow}
        className="mb-4"
      >
        {([
          { key: "all",         label: `All (${counts.all})`                    },
          { key: "todo",        label: `To Do (${counts.todo})`                 },
          { key: "in_progress", label: `In Progress (${counts.in_progress})`    },
          { key: "done",        label: `Done (${counts.done})`                  },
        ] as { key: "all"|Status; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[th.pill, statusFilter === f.key && th.pillActive]}
            onPress={() => setStatus(f.key)}
            className="p-4 h-8 mb-4 flex flex-row items-center"
          >
            {statusFilter === f.key && (
              <LinearGradient
                colors={[C.indigoD, C.indigo]}
                start={{ x:0,y:0 }} end={{ x:1,y:0 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <Text style={[th.pillText, statusFilter === f.key && th.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort label */}
      <View style={th.sortRow}>
        <Text style={th.sortLabel}>
          Sorted by <Text style={{ color: C.indigoL }}>{sortBy === "priority" ? "priority" : "date"}</Text>
        </Text>
        <Text style={th.sortLabel}>{displayed.length} tasks</Text>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onPress={() => router.push(`/(tabs)/pulse/${item.id}` as any)}
            onToggle={() => toggle(item.id)}
            onDelete={() => remove(item.id)}
          />
        )}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <CheckSquare size={44} color={C.dim} strokeWidth={1.5} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>No tasks here</Text>
            <Text style={{ fontSize: 13, color: C.muted }}>
              Tap + to add one, or ask Era to create tasks for you.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={{ position: "absolute", bottom: 28, right: 20 }}
        onPress={() => setShowModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient colors={[C.indigoD, C.indigo]} style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }}>
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      <CreateTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={create}
      />
    </SafeAreaView>
  );
}

const th = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", color: C.text },
  sortBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg2, overflow: "hidden",
  },
  pillActive: { borderColor: C.indigo },
  pillText: { fontSize: 13, fontWeight: "600", color: C.muted },
  pillTextActive: { color: "#fff" },
  sortRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 4,
  },
  sortLabel: { fontSize: 12, color: C.dim, fontWeight: "500" },
});