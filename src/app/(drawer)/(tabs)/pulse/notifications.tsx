import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  BellOff,
  MessageSquare,
  AtSign,
  Star,
  Volume2,
  Sparkles,
  Users,
  Check,
  Trash2,
  ChevronLeft,
  Settings,
} from "lucide-react-native";

const C = {
  bg0: "#0B0E1A", bg1: "#111827", bg2: "#1a2235", bg3: "#252D3D",
  indigo: "#6366F1", indigoD: "#4F46E5", indigoL: "#818CF8",
  text: "#F1F5F9", muted: "#94A3B8", dim: "#64748B",
  border: "rgba(255,255,255,0.06)", green: "#22C55E",
  amber: "#F59E0B", red: "#EF4444", pink: "#F472B6", violet: "#A78BFA",
};

const NOTIFS = [
  { id: "n1", type: "message",  sender: "Alex Chen",    avatar: "A", avatarColor: ["#6366F1","#8B5CF6"] as [string,string], body: "Heard you! Sending the file now 📎",       time: "now",       read: false },
  { id: "n2", type: "mention",  sender: "Design Team",  avatar: "D", avatarColor: ["#EC4899","#F43F5E"] as [string,string], body: "@you can you review the new components?",   time: "9m ago",    read: false },
  { id: "n3", type: "reaction", sender: "Maya Patel",   avatar: "M", avatarColor: ["#10B981","#059669"] as [string,string], body: "Reacted 🔥 to \"Yeah it looks amazing!\"",  time: "34m ago",   read: false },
  { id: "n4", type: "voice",    sender: "Jordan Lee",   avatar: "J", avatarColor: ["#F59E0B","#EF4444"] as [string,string], body: "Sent a voice note · 0:24",                   time: "1h ago",    read: true  },
  { id: "n5", type: "era",      sender: "Era AI",       avatar: "✦", avatarColor: ["#4338CA","#6366F1"] as [string,string], body: "Your morning digest is ready to review",    time: "8h ago",    read: true  },
  { id: "n6", type: "group",    sender: "Project Alpha",avatar: "P", avatarColor: ["#0EA5E9","#6366F1"] as [string,string], body: "Priya: Deployment is live ✅",               time: "Yesterday", read: true  },
  { id: "n7", type: "message",  sender: "Sam Rivera",   avatar: "S", avatarColor: ["#10B981","#3B82F6"] as [string,string], body: "See you at the standup!",                   time: "Yesterday", read: true  },
  { id: "n8", type: "era",      sender: "Era AI",       avatar: "✦", avatarColor: ["#DB2777","#A78BFA"] as [string,string], body: "You haven't replied to Sam in 2 days. Draft a follow-up?", time: "2d ago", read: true },
];

function NotifIcon({ type }: { type: string }) {
  const props = { size: 14, color: "#fff", strokeWidth: 2 };
  switch (type) {
    case "message":  return <MessageSquare {...props} />;
    case "mention":  return <AtSign        {...props} />;
    case "reaction": return <Star          {...props} />;
    case "voice":    return <Volume2       {...props} />;
    case "era":      return <Sparkles      {...props} />;
    case "group":    return <Users         {...props} />;
    default:         return <Bell          {...props} />;
  }
}

function typeColor(type: string): [string, string] {
  switch (type) {
    case "mention":  return [C.pink,   C.violet];
    case "reaction": return ["#F59E0B","#EF4444"];
    case "voice":    return ["#10B981","#3B82F6"];
    case "era":      return ["#DB2777",C.violet];
    case "group":    return ["#0EA5E9",C.indigo];
    default:         return [C.indigoD,C.indigo];
  }
}

const NotifRow: React.FC<{
  item: typeof NOTIFS[0];
  index: number;
  onPress: () => void;
  onDelete: () => void;
}> = ({ item, index, onPress, onDelete }) => {
  const o = useSharedValue(0);
  const x = useSharedValue(16);
  useEffect(() => {
    o.value = withDelay(index * 40, withTiming(1, { duration: 300 }));
    x.value = withDelay(index * 40, withSpring(0, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: o.value, transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[nr.wrap, !item.read && nr.unreadWrap]}>
          {!item.read && <View style={nr.dot} />}
          <View style={nr.avatarWrap}>
            <LinearGradient colors={item.avatarColor} style={nr.avatar}>
              <Text style={nr.avatarText}>{item.avatar}</Text>
            </LinearGradient>
            <LinearGradient colors={typeColor(item.type)} style={nr.typeBadge}>
              <NotifIcon type={item.type} />
            </LinearGradient>
          </View>
          <View style={nr.content}>
            <View style={nr.topRow}>
              <Text style={[nr.sender, !item.read && nr.senderUnread]} numberOfLines={1}>
                {item.sender}
              </Text>
              <Text style={nr.time}>{item.time}</Text>
            </View>
            <Text style={nr.body} numberOfLines={2}>{item.body}</Text>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={14} color={C.dim} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const nr = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: C.border, position: "relative",
  },
  unreadWrap: { backgroundColor: "rgba(99,102,241,0.04)" },
  dot: { position: "absolute", left: 6, top: 20, width: 6, height: 6, borderRadius: 3, backgroundColor: C.indigo },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "700", color: "#fff" },
  typeBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: C.bg1,
  },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sender: { fontSize: 14, fontWeight: "600", color: C.muted, flex: 1, marginRight: 8 },
  senderUnread: { color: C.text },
  time: { fontSize: 11, color: C.dim },
  body: { fontSize: 13, color: C.muted, lineHeight: 19 },
});

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState(NOTIFS);
  const [dnd, setDnd] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = items.filter((i) => !i.read).length;
  const displayed = filter === "unread" ? items.filter((i) => !i.read) : items;

  const markAllRead = () => setItems((p) => p.map((i) => ({ ...i, read: true })));
  const deleteItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const clearAll = () =>
    Alert.alert("Clear All", "Remove all notifications?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setItems([]) },
    ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      {/* Header */}
      <View style={nh.header}>
        <TouchableOpacity onPress={() => router.back()} style={nh.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={nh.title}>Notifications</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={nh.action}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* DND Toggle */}
      <View style={nh.dndRow}>
        <BellOff size={16} color={dnd ? C.red : C.dim} strokeWidth={2} />
        <Text style={nh.dndText}>Do Not Disturb</Text>
        <Switch
          value={dnd}
          onValueChange={setDnd}
          trackColor={{ false: C.bg3, true: C.red + "80" }}
          thumbColor={dnd ? C.red : "#fff"}
        />
      </View>

      {/* Filter + mark read */}
      <View style={nh.filterRow}>
        <View style={nh.tabs}>
          {(["all", "unread"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[nh.tab, filter === f && nh.tabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[nh.tabText, filter === f && nh.tabTextActive]}>
                {f === "all" ? "All" : `Unread (${unread})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <View style={nh.markBtn}>
              <Check size={12} color={C.indigoL} strokeWidth={2.5} />
              <Text style={nh.markText}>Mark all read</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <NotifRow
            item={item}
            index={index}
            onPress={() => setItems((p) => p.map((x) => x.id === item.id ? { ...x, read: true } : x))}
            onDelete={() => deleteItem(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <Bell size={44} color={C.dim} strokeWidth={1.5} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>All clear</Text>
            <Text style={{ fontSize: 13, color: C.muted }}>No notifications to show.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const nh = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", color: C.text },
  action: { fontSize: 14, color: C.red, fontWeight: "500" },
  dndRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: C.bg1, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  dndText: { flex: 1, fontSize: 15, fontWeight: "500", color: C.text },
  filterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  tabs: { flexDirection: "row", backgroundColor: C.bg2, borderRadius: 10, padding: 2 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tabActive: { backgroundColor: C.indigo },
  tabText: { fontSize: 13, fontWeight: "600", color: C.muted },
  tabTextActive: { color: "#fff" },
  markBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  markText: { fontSize: 12, color: C.indigoL, fontWeight: "600" },
});