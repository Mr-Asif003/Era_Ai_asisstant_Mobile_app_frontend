import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Clock,
  CheckSquare,
  AtSign,
  Activity,
  ChevronRight,
  Zap,
  Sparkles,
  MessageSquare,
  Star,
  Calendar,
  AlertCircle,
  TrendingUp,
  Volume2,
} from "lucide-react-native";

const { width: W } = Dimensions.get("window");

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg0:     "#0B0E1A",
  bg1:     "#111827",
  bg2:     "#1a2235",
  bg3:     "#252D3D",
  indigo:  "#6366F1",
  indigoD: "#4F46E5",
  indigoL: "#818CF8",
  text:    "#F1F5F9",
  muted:   "#94A3B8",
  dim:     "#64748B",
  border:  "rgba(255,255,255,0.06)",
  green:   "#22C55E",
  amber:   "#F59E0B",
  red:     "#EF4444",
  pink:    "#F472B6",
  violet:  "#A78BFA",
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const FEED_ITEMS = [
  {
    id: "1",
    type: "era_digest",
    title: "Morning Digest Ready",
    body: "You have 12 unread messages, 2 reminders due today, and 3 tasks pending. Alex sent a voice note.",
    time: "now",
    read: false,
    icon: "sparkles",
    color: [C.pink, C.violet] as [string, string],
    action: "view_digest",
  },
  {
    id: "2",
    type: "reminder",
    title: "Call Jordan Lee",
    body: "Reminder set for 3:00 PM today — tap to reschedule or mark done.",
    time: "2m ago",
    read: false,
    icon: "clock",
    color: [C.amber, "#F97316"] as [string, string],
    action: "view_reminder",
    dueTime: "3:00 PM",
  },
  // {
  //   id: "3",
  //   type: "mention",
  //   title: "Alex mentioned you",
  //   body: "In Design Team: \"@you can you review the new components before EOD?\"",
  //   time: "9m ago",
  //   read: false,
  //   icon: "at_sign",
  //   color: [C.indigo, C.indigoL] as [string, string],
  //   action: "open_chat",
  //   chatId: "2",
  // },
  {
    id: "4",
    type: "task",
    title: "Task Due Today",
    body: "Review Figma handoff for Project Alpha — deadline 5:00 PM.",
    time: "34m ago",
    read: true,
    icon: "check_square",
    color: ["#10B981", "#059669"] as [string, string],
    action: "view_task",
    taskId: "task_1",
  },
  {
    id: "5",
    type: "notification",
    title: "Maya reacted to your message",
    body: "Maya Patel reacted 🔥 to \"Yeah it looks amazing!\"",
    time: "1h ago",
    read: true,
    icon: "star",
    color: ["#EC4899", "#F43F5E"] as [string, string],
    action: "open_chat",
    chatId: "2",
  },
  {
    id: "6",
    type: "era_nudge",
    title: "Era Nudge",
    body: "You haven't replied to Sam Rivera in 2 days. Want me to draft a quick follow-up?",
    time: "2h ago",
    read: true,
    icon: "sparkles",
    color: [C.pink, C.violet] as [string, string],
    action: "era_compose",
  },
  {
    id: "7",
    type: "notification",
    title: "Voice note from Jordan",
    body: "Jordan Lee sent a 24-second voice note in your conversation.",
    time: "3h ago",
    read: true,
    icon: "volume",
    color: ["#F59E0B", "#EF4444"] as [string, string],
    action: "open_chat",
    chatId: "3",
  },
  {
    id: "8",
    type: "reminder",
    title: "Team Standup",
    body: "Thursday standup with Sam confirmed — starts in 45 minutes.",
    time: "Yesterday",
    read: true,
    icon: "calendar",
    color: ["#0EA5E9", "#6366F1"] as [string, string],
    action: "view_reminder",
  },
];

const QUICK_STATS = [
  { label: "Unread",   value: "12", icon: Bell,        color: C.indigo,  route: "/(tabs)/pulse/notifications" },
  { label: "Due Today",value: "3",  icon: Clock,       color: C.amber,   route: "/(tabs)/pulse/reminders" },
  { label: "Tasks",    value: "7",  icon: CheckSquare, color: C.green,   route: "/(tabs)/pulse/tasks" },
  // { label: "Mentions", value: "2",  icon: AtSign,      color: C.pink,    route: "/(tabs)/pulse/mentions" },
];

const FILTER_TABS = [
  { key: "all",          label: "All"          },
  { key: "unread",       label: "Unread"       },
  { key: "reminders",    label: "Reminders"    },
  { key: "tasks",        label: "Tasks"        },
  // { key: "mentions",     label: "Mentions"     },
  { key: "era",          label: "Era"          },
];

// ─── Icon resolver ─────────────────────────────────────────────────────────────
function FeedIcon({ type, color }: { type: string; color: string }) {
  const s = { size: 18, color, strokeWidth: 2 };
  switch (type) {
    case "sparkles":    return <Sparkles    {...s} />;
    case "clock":       return <Clock       {...s} />;
    case "at_sign":     return <AtSign      {...s} />;
    case "check_square":return <CheckSquare {...s} />;
    case "star":        return <Star        {...s} />;
    case "volume":      return <Volume2     {...s} />;
    case "calendar":    return <Calendar    {...s} />;
    default:            return <Bell        {...s} />;
  }
}

// ─── Quick stat card ───────────────────────────────────────────────────────────
const StatCard: React.FC<{
  item: typeof QUICK_STATS[0];
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const o = useSharedValue(0);
  const y = useSharedValue(16);
  const scale = useSharedValue(1);

  useEffect(() => {
    o.value = withDelay(index * 80, withTiming(1, { duration: 400 }));
    y.value = withDelay(index * 80, withSpring(0, { damping: 14 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={1}
      >
        <View style={[ss.card, { borderColor: `${item.color}30` }]}>
          <View style={[ss.iconWrap, { backgroundColor: `${item.color}18` }]}>
            <item.icon size={18} color={item.color} strokeWidth={2} />
          </View>
          <Text style={[ss.value, { color: item.color }]}>{item.value}</Text>
          <Text style={ss.label}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ss = StyleSheet.create({
  card: {
    width: (W - 56) / 4,
    backgroundColor: C.bg1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },
  label: { fontSize: 10, color: C.muted, fontWeight: "500" },
});

// ─── Feed item ─────────────────────────────────────────────────────────────────
const FeedItem: React.FC<{
  item: typeof FEED_ITEMS[0];
  index: number;
  onPress: () => void;
  onMarkRead: () => void;
}> = ({ item, index, onPress, onMarkRead }) => {
  const o = useSharedValue(0);
  const x = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    o.value = withDelay(index * 50, withTiming(1, { duration: 350 }));
    x.value = withDelay(index * 50, withSpring(0, { damping: 14 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateX: x.value }, { scale: scale.value }],
  }));

  const isEra = item.type === "era_digest" || item.type === "era_nudge";

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.985, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={1}
      >
        <View style={[
          fi.wrap,
          !item.read && fi.unread,
          isEra && fi.eraWrap,
        ]}>
          {/* Unread dot */}
          {!item.read && <View style={fi.unreadDot} />}

          {/* Icon */}
          <LinearGradient colors={item.color} style={fi.iconGrad}>
            <FeedIcon type={item.icon} color="#fff" />
          </LinearGradient>

          {/* Content */}
          <View style={fi.content}>
            <View style={fi.topRow}>
              <Text style={[fi.title, !item.read && fi.titleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={fi.time}>{item.time}</Text>
            </View>
            <Text style={fi.body} numberOfLines={2}>{item.body}</Text>

            {/* Type-specific chips */}
            {item.type === "reminder" && item.dueTime && (
              <View style={fi.chip}>
                <Clock size={10} color={C.amber} strokeWidth={2} />
                <Text style={[fi.chipText, { color: C.amber }]}>Due {item.dueTime}</Text>
              </View>
            )}
            {isEra && (
              <View style={[fi.chip, { backgroundColor: "rgba(244,114,182,0.1)", borderColor: "rgba(244,114,182,0.2)" }]}>
                <Sparkles size={10} color={C.pink} strokeWidth={2} />
                <Text style={[fi.chipText, { color: C.pink }]}>Era</Text>
              </View>
            )}
          </View>

          <ChevronRight size={14} color={C.dim} strokeWidth={2} style={{ flexShrink: 0 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const fi = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  unread: { backgroundColor: "rgba(99,102,241,0.04)" },
  eraWrap: { backgroundColor: "rgba(244,114,182,0.04)" },
  unreadDot: {
    position: "absolute",
    left: 6,
    top: "50%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.indigo,
  },
  iconGrad: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "600", color: C.muted, flex: 1, marginRight: 8 },
  titleUnread: { color: C.text },
  time: { fontSize: 11, color: C.dim },
  body: { fontSize: 13, color: C.muted, lineHeight: 19 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 2,
  },
  chipText: { fontSize: 10, fontWeight: "600" },
});

// ─── Era Digest Banner ─────────────────────────────────────────────────────────
const EraDigestBanner: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const pulse = useSharedValue(0.95);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.95, { duration: 2000 })),
      -1, true
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View style={[style, { margin: 16 }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <LinearGradient
          colors={["rgba(219,39,119,0.2)", "rgba(124,58,237,0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={db.wrap}
        >
          <View style={db.left}>
            <LinearGradient colors={["#DB2777", "#A78BFA"]} style={db.orbSmall}>
              <Sparkles size={16} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <View>
              <Text style={db.title}>Era Morning Digest</Text>
              <Text style={db.sub}>Tap to hear your daily briefing</Text>
            </View>
          </View>
          <View style={db.pill}>
            <Text style={db.pillText}>New</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const db = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.3)",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  orbSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "700", color: C.text },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  pill: {
    backgroundColor: "rgba(244,114,182,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.4)",
  },
  pillText: { fontSize: 11, fontWeight: "700", color: "#F472B6" },
});

// ─── Main Pulse Screen ─────────────────────────────────────────────────────────
export default function PulseScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(FEED_ITEMS);
  const [refreshing, setRefreshing] = useState(false);

  const headerO = useSharedValue(0);
  const headerY = useSharedValue(-12);

  useEffect(() => {
    headerO.value = withTiming(1, { duration: 500 });
    headerY.value = withSpring(0, { damping: 14 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerO.value,
    transform: [{ translateY: headerY.value }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "all")       return true;
    if (filter === "unread")    return !item.read;
    if (filter === "reminders") return item.type === "reminder";
    if (filter === "tasks")     return item.type === "task";
    // if (filter === "mentions")  return item.type === "mention";
    if (filter === "era")       return item.type === "era_digest" || item.type === "era_nudge";
    return true;
  });

  const unreadCount = items.filter((i) => !i.read).length;

  const handleItemPress = (item: typeof FEED_ITEMS[0]) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, read: true } : i));
    if (item.action === "open_chat" && item.chatId) {
      router.push(`/(tabs)/chats/${item.chatId}` as any);
    } else if (item.action === "view_reminder") {
      router.push("/(tabs)/pulse/reminders");
    } else if (item.action === "view_task" && item.taskId) {
      router.push(`/(tabs)/pulse/${item.taskId}` as any);
    } else if (item.action === "view_digest") {
      router.push("/(tabs)/pulse/notifications");
    }
  };

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      {/* Ambient glow */}
      <View style={s.glow} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.indigo}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, headerStyle]}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.eyebrow}>PULSE</Text>
              <Text style={s.title}>Activity</Text>
            </View>
            <View style={s.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity style={s.markAllBtn} onPress={markAllRead}>
                  <Text style={s.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => router.push("/(tabs)/pulse/activity")}
              >
                <Activity size={18} color={C.indigoL} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick stats */}
          <View style={s.statsRow}>
            {QUICK_STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                item={stat}
                index={i}
                onPress={() => router.push(stat.route as any)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Era digest banner */}
        <EraDigestBanner onPress={() => router.push("/(tabs)/pulse/notifications")} />

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.filterPill, filter === tab.key && s.filterPillActive]}
              onPress={() => setFilter(tab.key)}
            >
              {filter === tab.key && (
                <LinearGradient
                  colors={[C.indigoD, C.indigo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <Text style={[s.filterText, filter === tab.key && s.filterTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>
            {filter === "all" ? "Recent activity" : FILTER_TABS.find(t => t.key === filter)?.label}
            <Text style={{ color: C.indigo }}> · {filtered.length}</Text>
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/pulse/activity")}>
            <Text style={s.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <View style={s.feedCard}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Zap size={40} color={C.dim} strokeWidth={1.5} />
              <Text style={s.emptyTitle}>All caught up</Text>
              <Text style={s.emptySub}>No activity matching this filter.</Text>
            </View>
          ) : (
            filtered.map((item, i) => (
              <FeedItem
                key={item.id}
                item={item}
                index={i}
                onPress={() => handleItemPress(item)}
                onMarkRead={() =>
                  setItems((prev) =>
                    prev.map((x) => x.id === item.id ? { ...x, read: true } : x)
                  )
                }
              />
            ))
          )}
        </View>

        {/* Quick nav shortcuts */}
        <View style={s.shortcutsGrid}>
          {[
            { label: "Notifications", icon: Bell,        route: "/(tabs)/pulse/notifications", color: C.indigo },
            { label: "Reminders",     icon: Clock,       route: "/(tabs)/pulse/reminders",     color: C.amber  },
            { label: "Tasks",         icon: CheckSquare, route: "/(tabs)/pulse/tasks",         color: C.green  },
            // { label: "Mentions",      icon: AtSign,      route: "/(tabs)/pulse/mentions",      color: C.pink   },
          ].map(({ label, icon: Icon, route, color }) => (
            <TouchableOpacity
              key={label}
              style={s.shortcutBtn}
              onPress={() => router.push(route as any)}
              activeOpacity={0.8}
            >
              <Icon size={20} color={color} strokeWidth={2} />
              <Text style={s.shortcutLabel}>{label}</Text>
              <ChevronRight size={14} color={C.dim} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },
  glow: {
    position: "absolute",
    top: -100,
    left: W / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(99,102,241,0.06)",
  },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 3, color: C.indigoL, marginBottom: 2 },
  title: { fontSize: 30, fontWeight: "800", color: C.text, letterSpacing: -0.8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  markAllBtn: {
    backgroundColor: C.bg2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  markAllText: { fontSize: 12, color: C.indigoL, fontWeight: "500" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 8 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg2,
    overflow: "hidden",
  },
  filterPillActive: { borderColor: C.indigo },
  filterText: { fontSize: 13, fontWeight: "600", color: C.muted },
  filterTextActive: { color: "#fff" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: C.dim, letterSpacing: 0.5, textTransform: "uppercase" },
  sectionLink: { fontSize: 12, color: C.indigoL, fontWeight: "600" },
  feedCard: {
    marginHorizontal: 16,
    backgroundColor: C.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  emptySub: { fontSize: 13, color: C.muted },
  shortcutsGrid: { marginHorizontal: 16, marginTop: 16, gap: 1 },
  shortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.bg1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  shortcutLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: C.text },
});