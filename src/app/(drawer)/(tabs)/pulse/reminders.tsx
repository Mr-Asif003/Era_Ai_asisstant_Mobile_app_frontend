import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Platform, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock, Plus, Check, Trash2, Bell, ChevronLeft,
  Edit3, Repeat, AlertCircle, Calendar,
} from "lucide-react-native";

const C = {
  bg0:"#0B0E1A",bg1:"#111827",bg2:"#1a2235",bg3:"#252D3D",
  indigo:"#6366F1",indigoD:"#4F46E5",indigoL:"#818CF8",
  text:"#F1F5F9",muted:"#94A3B8",dim:"#64748B",
  border:"rgba(255,255,255,0.06)",green:"#22C55E",
  amber:"#F59E0B",red:"#EF4444",pink:"#F472B6",
};

interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  repeat: "none" | "daily" | "weekly";
  done: boolean;
  priority: "low" | "medium" | "high";
}

const MOCK_REMINDERS: Reminder[] = [
  { id:"r1", title:"Call Jordan Lee",             time:"3:00 PM", date:"Today",     repeat:"none",   done:false, priority:"high"   },
  { id:"r2", title:"Review Figma handoff",         time:"5:00 PM", date:"Today",     repeat:"none",   done:false, priority:"medium" },
  { id:"r3", title:"Team standup",                 time:"10:00 AM",date:"Tomorrow",  repeat:"weekly", done:false, priority:"medium" },
  { id:"r4", title:"Reply to Alex about deadline", time:"9:00 AM", date:"Tomorrow",  repeat:"none",   done:false, priority:"low"    },
  { id:"r5", title:"Morning workout",              time:"7:00 AM", date:"Every day", repeat:"daily",  done:false, priority:"low"    },
  { id:"r6", title:"Send project proposal",        time:"2:00 PM", date:"Mon, Jan 20",repeat:"none",  done:true,  priority:"high"   },
];

const priorityConfig = {
  high:   { color: C.red,    bg: "rgba(239,68,68,0.12)",   label: "High"   },
  medium: { color: C.amber,  bg: "rgba(245,158,11,0.12)",  label: "Medium" },
  low:    { color: C.green,  bg: "rgba(34,197,94,0.12)",   label: "Low"    },
};

const ReminderCard: React.FC<{
  item: Reminder;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ item, index, onToggle, onDelete, onEdit }) => {
  const o = useSharedValue(0);
  const y = useSharedValue(12);
  useEffect(() => {
    o.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
    y.value = withDelay(index * 60, withSpring(0, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));
  const pc = priorityConfig[item.priority];

  return (
    <Animated.View style={[style, { marginHorizontal: 16, marginBottom: 10 }]}>
      <View style={[rc.card, item.done && rc.cardDone]}>
        {/* Priority bar */}
        <View style={[rc.priorityBar, { backgroundColor: pc.color }]} />

        <View style={rc.inner}>
          {/* Check button */}
          <TouchableOpacity onPress={onToggle} style={[rc.checkBtn, item.done && rc.checkBtnDone]}>
            {item.done && <Check size={14} color="#fff" strokeWidth={3} />}
          </TouchableOpacity>

          {/* Content */}
          <View style={rc.content}>
            <Text style={[rc.title, item.done && rc.titleDone]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={rc.metaRow}>
              <View style={rc.timeChip}>
                <Clock size={10} color={C.amber} strokeWidth={2} />
                <Text style={rc.timeText}>{item.time} · {item.date}</Text>
              </View>
              {item.repeat !== "none" && (
                <View style={rc.repeatChip}>
                  <Repeat size={10} color={C.indigoL} strokeWidth={2} />
                  <Text style={rc.repeatText}>
                    {item.repeat === "daily" ? "Daily" : "Weekly"}
                  </Text>
                </View>
              )}
              <View style={[rc.priorityChip, { backgroundColor: pc.bg }]}>
                <Text style={[rc.priorityText, { color: pc.color }]}>{pc.label}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={rc.actions}>
            <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Edit3 size={14} color={C.dim} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={14} color={C.dim} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const rc = StyleSheet.create({
  card: {
    backgroundColor: C.bg1, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, overflow: "hidden", flexDirection: "row",
  },
  cardDone: { opacity: 0.5 },
  priorityBar: { width: 4 },
  inner: { flex: 1, flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  checkBtn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: C.dim,
    alignItems: "center", justifyContent: "center",
  },
  checkBtnDone: { backgroundColor: C.green, borderColor: C.green },
  content: { flex: 1, gap: 6 },
  title: { fontSize: 15, fontWeight: "600", color: C.text },
  titleDone: { textDecorationLine: "line-through", color: C.muted },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  timeChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 11, color: C.amber, fontWeight: "500" },
  repeatChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(99,102,241,0.1)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  repeatText: { fontSize: 10, color: C.indigoL, fontWeight: "600" },
  priorityChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontSize: 10, fontWeight: "700" },
  actions: { gap: 10 },
});

// ─── Create reminder modal ─────────────────────────────────────────────────────
const CreateReminderModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreate: (r: Reminder) => void;
}> = ({ visible, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("3:00 PM");
  const [date, setDate] = useState("Today");
  const [priority, setPriority] = useState<"low"|"medium"|"high">("medium");
  const [repeat, setRepeat] = useState<"none"|"daily"|"weekly">("none");

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      id: Date.now().toString(),
      title: title.trim(), time, date, priority, repeat, done: false,
    });
    setTitle(""); setTime("3:00 PM"); setDate("Today");
    setPriority("medium"); setRepeat("none");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={cm.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={cm.sheet}>
        <View style={cm.handle} />
        <Text style={cm.sheetTitle}>New Reminder</Text>

        <TextInput
          style={cm.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What do you need to remember?"
          placeholderTextColor={C.dim}
          autoFocus
        />

        <View style={cm.row}>
          <View style={cm.fieldWrap}>
            <Text style={cm.fieldLabel}>Time</Text>
            <TextInput style={cm.fieldInput} value={time} onChangeText={setTime}
              placeholderTextColor={C.dim} />
          </View>
          <View style={cm.fieldWrap}>
            <Text style={cm.fieldLabel}>Date</Text>
            <TextInput style={cm.fieldInput} value={date} onChangeText={setDate}
              placeholderTextColor={C.dim} />
          </View>
        </View>

        <Text style={cm.fieldLabel}>Priority</Text>
        <View style={cm.pillRow}>
          {(["low","medium","high"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[cm.pill, priority === p && { backgroundColor: priorityConfig[p].color }]}
              onPress={() => setPriority(p)}
            >
              <Text style={[cm.pillText, priority === p && { color: "#fff" }]}>
                {priorityConfig[p].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={cm.fieldLabel}>Repeat</Text>
        <View style={cm.pillRow}>
          {(["none","daily","weekly"] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[cm.pill, repeat === r && { backgroundColor: C.indigo }]}
              onPress={() => setRepeat(r)}
            >
              <Text style={[cm.pillText, repeat === r && { color: "#fff" }]}>
                {r === "none" ? "Once" : r === "daily" ? "Daily" : "Weekly"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleCreate} disabled={!title.trim()} activeOpacity={0.85}>
          <LinearGradient
            colors={[C.indigoD, C.indigo]}
            start={{ x:0,y:0 }} end={{ x:1,y:0 }}
            style={cm.createBtn}
          >
            <Bell size={18} color="#fff" strokeWidth={2} />
            <Text style={cm.createText}>Set Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const cm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: C.bg1, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 16,
    borderWidth: 1, borderBottomWidth: 0, borderColor: C.border,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.dim, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  input: {
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: C.text,
  },
  row: { flexDirection: "row", gap: 12 },
  fieldWrap: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: C.muted, letterSpacing: 0.3 },
  fieldInput: {
    backgroundColor: C.bg2, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text,
  },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
  },
  pillText: { fontSize: 13, fontWeight: "600", color: C.muted },
  createBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 15, marginTop: 4,
  },
  createText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all"|"today"|"upcoming"|"done">("all");

  const today    = reminders.filter((r) => !r.done && r.date === "Today");
  const upcoming = reminders.filter((r) => !r.done && r.date !== "Today");
  const done     = reminders.filter((r) => r.done);

  const displayed = filter === "today" ? today
    : filter === "upcoming" ? upcoming
    : filter === "done" ? done
    : reminders;

  const toggle  = (id: string) => setReminders((p) => p.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  const remove  = (id: string) => setReminders((p) => p.filter((r) => r.id !== id));
  const create  = (r: Reminder) => setReminders((p) => [r, ...p]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      {/* Header */}
      <View style={rh.header}>
        <TouchableOpacity onPress={() => router.back()} style={rh.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={rh.title}>Reminders</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={rh.addBtn}>
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Summary chips */}
      <View style={rh.summaryRow}>
        {[
          { key:"all",      label:"All",      count: reminders.length,  color: C.indigo },
          { key:"today",    label:"Today",    count: today.length,      color: C.amber  },
          { key:"upcoming", label:"Upcoming", count: upcoming.length,   color: C.indigoL},
          { key:"done",     label:"Done",     count: done.length,       color: C.green  },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[rh.chip, filter === f.key && { backgroundColor: `${f.color}20`, borderColor: f.color }]}
            onPress={() => setFilter(f.key as any)}
          >
            <Text style={[rh.chipCount, { color: filter === f.key ? f.color : C.dim }]}>{f.count}</Text>
            <Text style={[rh.chipLabel, { color: filter === f.key ? f.color : C.dim }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <ReminderCard
            item={item}
            index={index}
            onToggle={() => toggle(item.id)}
            onDelete={() => remove(item.id)}
            onEdit={() => Alert.alert("Edit", "Edit reminder coming soon")}
          />
        )}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <Clock size={44} color={C.dim} strokeWidth={1.5} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>No reminders</Text>
            <Text style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>
              Tap + to create one, or ask Era to set a reminder for you.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={rh.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient colors={[C.indigoD, C.indigo]} style={rh.fabGrad}>
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      <CreateReminderModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={create}
      />
    </SafeAreaView>
  );
}

const rh = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", color: C.text },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.indigo, alignItems: "center", justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 8, padding: 16 },
  chip: {
    flex: 1, alignItems: "center", paddingVertical: 10,
    backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.border,
  },
  chipCount: { fontSize: 18, fontWeight: "700" },
  chipLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  fab: {
    position: "absolute", bottom: 28, right: 20,
    shadowColor: C.indigo, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
  fabGrad: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});