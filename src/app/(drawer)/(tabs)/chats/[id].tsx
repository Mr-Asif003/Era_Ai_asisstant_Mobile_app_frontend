import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
   Send,
  Mic,
  Paperclip,
  Image,
  Smile,
  Camera,
} from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/lib/constants";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
type MessageType = "text" | "voice" | "image" | "file";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  status: MessageStatus;
  type: MessageType;
  voiceDuration?: number;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: { emoji: string; userId: string }[];
  isDeleted?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatarColor: [string, string];
  initial: string;
  isOnline: boolean;
  lastSeen?: string;
}

// ─── Mock Data (replace with API/WebSocket) ───────────────────────────────────

const MOCK_USER: ChatUser = {
  id: "me",
  name: "You",
  avatarColor: ["#6366F1", "#8B5CF6"],
  initial: "Y",
  isOnline: true,
};

const MOCK_CHAT_USERS: Record<string, ChatUser> = {
  "1": {
    id: "1",
    name: "Alex Chen",
    avatarColor: ["#6366F1", "#8B5CF6"],
    initial: "A",
    isOnline: true,
  },
  "2": {
    id: "2",
    name: "Maya Patel",
    avatarColor: ["#EC4899", "#F43F5E"],
    initial: "M",
    isOnline: false,
    lastSeen: "5 minutes ago",
  },
  "3": {
    id: "3",
    name: "Jordan Lee",
    avatarColor: ["#F59E0B", "#EF4444"],
    initial: "J",
    isOnline: true,
  },
};

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hey! Did you see the new update? 👀",
    senderId: "1",
    receiverId: "me",
    timestamp: "2024-01-15T09:38:00Z",
    status: "read",
    type: "text",
  },
  {
    id: "2",
    text: "Yeah it looks amazing! The animations are so smooth 🔥",
    senderId: "me",
    receiverId: "1",
    timestamp: "2024-01-15T09:39:00Z",
    status: "read",
    type: "text",
  },
  {
    id: "3",
    text: "",
    senderId: "1",
    receiverId: "me",
    timestamp: "2024-01-15T09:40:00Z",
    status: "read",
    type: "voice",
    voiceDuration: 24,
  },
  {
    id: "4",
    text: "I sent you a voice note, check it out!",
    senderId: "1",
    receiverId: "me",
    timestamp: "2024-01-15T09:41:00Z",
    status: "read",
    type: "text",
    reactions: [{ emoji: "🔥", userId: "me" }],
  },
  {
    id: "5",
    text: "Just listened — that part at 0:18 is exactly what I was thinking about!",
    senderId: "me",
    receiverId: "1",
    timestamp: "2024-01-15T09:42:00Z",
    status: "delivered",
    type: "text",
    replyTo: {
      id: "3",
      text: "Voice message · 0:24",
      senderName: "Alex Chen",
    },
  },
  {
    id: "6",
    text: "Can we hop on a call later to discuss?",
    senderId: "me",
    receiverId: "1",
    timestamp: "2024-01-15T09:43:00Z",
    status: "sent",
    type: "text",
  },
];

const EMOJI_REACTIONS = ["❤️", "🔥", "😂", "👍", "😮", "😢"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getDate() - d.getDate();
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function shouldShowDate(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].timestamp);
  const curr = new Date(messages[index].timestamp);
  return prev.getDate() !== curr.getDate();
}

function formatVoiceDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Status Tick ──────────────────────────────────────────────────────────────

const StatusTick: React.FC<{ status: MessageStatus }> = ({ status }) => {
  if (status === "sending") return <Text style={tick.icon}>🕐</Text>;
  if (status === "failed") return <Text style={tick.icon}>⚠️</Text>;
  if (status === "sent") return <Text style={[tick.icon, { color: COLORS.text.disabled }]}>✓</Text>;
  if (status === "delivered") return <Text style={[tick.icon, { color: COLORS.text.disabled }]}>✓✓</Text>;
  if (status === "read") return <Text style={[tick.icon, { color: COLORS.indigo.light }]}>✓✓</Text>;
  return null;
};

const tick = StyleSheet.create({
  icon: { fontSize: 11, marginLeft: 4 },
});

// ─── Date Separator ───────────────────────────────────────────────────────────

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
  <View style={ds.wrap}>
    <View style={ds.line} />
    <View style={ds.pill}>
      <Text style={ds.text}>{date}</Text>
    </View>
    <View style={ds.line} />
  </View>
);

const ds = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  pill: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  text: { fontSize: 11, color: COLORS.text.disabled, fontWeight: "500" },
});

// ─── Reply Preview (inside input bar) ────────────────────────────────────────

const ReplyPreview: React.FC<{
  replyTo: Message["replyTo"];
  onCancel: () => void;
}> = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;
  return (
    <Animated.View entering={SlideInDown.duration(200)} style={rp.wrap}>
      <View style={rp.bar} />
      <View style={rp.content}>
        <Text style={rp.name}>{replyTo.senderName}</Text>
        <Text style={rp.text} numberOfLines={1}>{replyTo.text}</Text>
      </View>
      <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={rp.cancel}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const rp = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg.tertiary,
    borderTopWidth: 1,
    borderTopColor: "rgba(99,102,241,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  bar: { width: 3, height: 36, borderRadius: 2, backgroundColor: COLORS.indigo.primary },
  content: { flex: 1 },
  name: { fontSize: 12, color: COLORS.indigo.light, fontWeight: "600", marginBottom: 2 },
  text: { fontSize: 12, color: COLORS.text.muted },
  cancel: { fontSize: 16, color: COLORS.text.disabled },
});

// ─── Voice Note Bubble ────────────────────────────────────────────────────────

const VoiceNoteBubble: React.FC<{
  duration: number;
  isMe: boolean;
  status: MessageStatus;
  timestamp: string;
}> = ({ duration, isMe, status, timestamp }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BARS = Array.from({ length: 28 }, (_, i) =>
    Math.max(4, Math.sin(i * 0.7) * 14 + 16 + Math.random() * 6)
  );

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setPlaying(true);
      setProgress(0);
      progressAnim.value = 0;
      const step = 100 / (duration * 10);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + step;
          if (next >= 100) {
            setPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return next;
        });
      }, 100);
    }
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const bgColor = isMe ? COLORS.indigo.primary : COLORS.bg.tertiary;
  const fgColor = isMe ? "rgba(255,255,255,0.9)" : COLORS.indigo.light;
  const mutedColor = isMe ? "rgba(255,255,255,0.35)" : "rgba(99,102,241,0.25)";

  return (
    <View style={vn.wrap}>
      <TouchableOpacity onPress={togglePlay} style={vn.playBtn}>
        <LinearGradient
          colors={isMe ? ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"] : [COLORS.indigo.dark, COLORS.indigo.primary]}
          style={vn.playGrad}
        >
          <Text style={{ fontSize: 14, color: "#fff" }}>{playing ? "⏸" : "▶"}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={vn.waveWrap}>
        <View style={vn.wave}>
          {BARS.map((h, i) => {
            const threshold = (i / BARS.length) * 100;
            const isActive = progress > threshold;
            return (
              <View
                key={i}
                style={{
                  width: 2.5,
                  height: h,
                  borderRadius: 2,
                  backgroundColor: isActive ? fgColor : mutedColor,
                  marginHorizontal: 1,
                }}
              />
            );
          })}
        </View>
        <View style={vn.footer}>
          <Text style={[vn.dur, { color: isMe ? "rgba(255,255,255,0.6)" : COLORS.text.disabled }]}>
            {playing
              ? formatVoiceDuration(Math.floor((progress / 100) * duration))
              : formatVoiceDuration(duration)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={[vn.time, { color: isMe ? "rgba(255,255,255,0.5)" : COLORS.text.disabled }]}>
              {formatTime(new Date().toISOString())}
            </Text>
            {isMe && <StatusTick status={status} />}
          </View>
        </View>
      </View>
    </View>
  );
};

const vn = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 180 },
  playBtn: {},
  playGrad: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  waveWrap: { flex: 1 },
  wave: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  dur: { fontSize: 10, fontWeight: "600" },
  time: { fontSize: 10 },
});

// ─── Reaction Picker ──────────────────────────────────────────────────────────

const ReactionPicker: React.FC<{
  onSelect: (emoji: string) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={rxp.wrap}>
      {EMOJI_REACTIONS.map((e) => (
        <TouchableOpacity
          key={e}
          style={rxp.btn}
          onPress={() => { onSelect(e); onClose(); }}
        >
          <Text style={rxp.emoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const rxp = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: COLORS.bg.card,
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 2,
    position: "absolute",
    top: -52,
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  btn: { padding: 4 },
  emoji: { fontSize: 22 },
});

// ─── Message Context Menu ─────────────────────────────────────────────────────

const ContextMenu: React.FC<{
  isMe: boolean;
  onReply: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReact: () => void;
  onClose: () => void;
}> = ({ isMe, onReply, onCopy, onDelete, onReact, onClose }) => {
  const items = [
    { label: "React", icon: "😊", action: onReact },
    { label: "Reply", icon: "↩️", action: () => { onReply(); onClose(); } },
    { label: "Copy", icon: "📋", action: () => { onCopy(); onClose(); } },
    ...(isMe ? [{ label: "Delete", icon: "🗑️", action: () => { onDelete(); onClose(); }, danger: true }] : []),
  ];

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[cm.wrap, isMe ? cm.wrapRight : cm.wrapLeft]}
    >
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.label}
          style={[cm.item, i < items.length - 1 && cm.itemBorder]}
          onPress={item.action}
        >
          <Text style={cm.icon}>{item.icon}</Text>
          <Text style={[cm.label, (item as any).danger && cm.danger]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const cm = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: -120,
    backgroundColor: COLORS.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    zIndex: 100,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
    minWidth: 160,
  },
  wrapRight: { right: 0 },
  wrapLeft: { left: 0 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  icon: { fontSize: 16 },
  label: { fontSize: 14, color: COLORS.text.primary, fontWeight: "500" },
  danger: { color: "#EF4444" },
});

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  chatUser: ChatUser;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onDelete: (msgId: string) => void;
}> = ({ message, isMe, showAvatar, chatUser, onReply, onReact, onDelete }) => {
  const [showContext, setShowContext] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const scale = useSharedValue(1);
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = () => {
    scale.value = withSequence(
      withTiming(0.96, { duration: 100 }),
      withSpring(1, { damping: 12 })
    );
    setShowContext(true);
  };

  if (message.isDeleted) {
    return (
      <View style={[mb.row, isMe && mb.rowMe]}>
        <View style={mb.deletedBubble}>
          <Text style={mb.deletedText}>🚫 Message deleted</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[mb.row, isMe && mb.rowMe]}>
      {/* Avatar */}
      {!isMe && (
        <View style={mb.avatarSlot}>
          {showAvatar ? (
            <LinearGradient colors={chatUser.avatarColor} style={mb.avatar}>
              <Text style={mb.avatarText}>{chatUser.initial}</Text>
            </LinearGradient>
          ) : (
            <View style={mb.avatarPlaceholder} />
          )}
        </View>
      )}

      <View style={[mb.bubbleWrap, isMe && mb.bubbleWrapMe]}>
        {/* Reply context */}
        {message.replyTo && (
          <View style={[mb.replyCtx, isMe && mb.replyCtxMe]}>
            <View style={mb.replyBar} />
            <View style={{ flex: 1 }}>
              <Text style={mb.replyName}>{message.replyTo.senderName}</Text>
              <Text style={mb.replyText} numberOfLines={1}>{message.replyTo.text}</Text>
            </View>
          </View>
        )}

        {/* Context menu + reaction picker overlay */}
        {(showContext || showReactions) && (
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => { setShowContext(false); setShowReactions(false); }}
          />
        )}

        {showReactions && (
          <ReactionPicker
            onSelect={(emoji) => onReact(message.id, emoji)}
            onClose={() => setShowReactions(false)}
          />
        )}

        {showContext && (
          <ContextMenu
            isMe={isMe}
            onReply={() => onReply(message)}
            onCopy={() => {
              Alert.alert("Copied", message.text);
            }}
            onDelete={() => onDelete(message.id)}
            onReact={() => {
              setShowContext(false);
              setShowReactions(true);
            }}
            onClose={() => setShowContext(false)}
          />
        )}

        {/* Bubble */}
        <Pressable onLongPress={handleLongPress} delayLongPress={350}>
          <Animated.View style={bubbleStyle}>
            {isMe ? (
              <LinearGradient
                colors={[COLORS.indigo.dark, COLORS.indigo.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  mb.bubble,
                  mb.bubbleMe,
                  message.type === "voice" && mb.bubbleVoice,
                ]}
              >
                {message.type === "voice" ? (
                  <VoiceNoteBubble
                    duration={message.voiceDuration ?? 0}
                    isMe
                    status={message.status}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <Text style={mb.textMe}>{message.text}</Text>
                )}
              </LinearGradient>
            ) : (
              <View
                style={[
                  mb.bubble,
                  mb.bubbleThem,
                  message.type === "voice" && mb.bubbleVoice,
                ]}
              >
                {message.type === "voice" ? (
                  <VoiceNoteBubble
                    duration={message.voiceDuration ?? 0}
                    isMe={false}
                    status={message.status}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <Text style={mb.textThem}>{message.text}</Text>
                )}
              </View>
            )}
          </Animated.View>
        </Pressable>

        {/* Reactions display */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={[mb.reactions, isMe && mb.reactionsMe]}>
            {message.reactions.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={mb.reactionChip}
                onPress={() => onReact(message.id, r.emoji)}
              >
                <Text style={{ fontSize: 13 }}>{r.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timestamp + status */}
        {message.type !== "voice" && (
          <View style={[mb.meta, isMe && mb.metaMe]}>
            <Text style={mb.time}>{formatTime(message.timestamp)}</Text>
            {isMe && <StatusTick status={message.status} />}
          </View>
        )}
      </View>
    </View>
  );
};

const mb = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 2,
    paddingHorizontal: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  rowMe: { flexDirection: "row-reverse" },
  avatarSlot: { width: 28, flexShrink: 0 },
  avatarPlaceholder: { width: 28 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  bubbleWrap: {
    maxWidth: SCREEN_W * 0.72,
    position: "relative",
  },
  bubbleWrapMe: { alignItems: "flex-end" },
  replyCtx: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    marginBottom: 3,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  replyCtxMe: { backgroundColor: "rgba(99,102,241,0.15)" },
  replyBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.indigo.primary,
  },
  replyName: { fontSize: 11, color: COLORS.indigo.light, fontWeight: "600", marginBottom: 2 },
  replyText: { fontSize: 11, color: COLORS.text.muted },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleVoice: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.bg.tertiary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  textMe: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 21,
  },
  textThem: {
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    marginLeft: 4,
  },
  metaMe: { justifyContent: "flex-end", marginRight: 4, marginLeft: 0 },
  time: { fontSize: 10, color: COLORS.text.disabled },
  reactions: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
    flexWrap: "wrap",
  },
  reactionsMe: { justifyContent: "flex-end" },
  reactionChip: {
    backgroundColor: COLORS.bg.card,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  deletedBubble: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  deletedText: {
    fontSize: 13,
    color: COLORS.text.disabled,
    fontStyle: "italic",
  },
});

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC<{ user: ChatUser }> = ({ user }) => {
  const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    dots.forEach((d, i) => {
      d.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );
    });
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={ty.wrap}
    >
      <LinearGradient colors={user.avatarColor} style={ty.avatar}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{user.initial}</Text>
      </LinearGradient>
      <View style={ty.bubble}>
        {dots.map((d, i) => {
          const s = useAnimatedStyle(() => ({
            transform: [{ translateY: interpolate(d.value, [0, 1], [0, -4], Extrapolation.CLAMP) }],
            opacity: interpolate(d.value, [0, 1], [0.4, 1], Extrapolation.CLAMP),
          }));
          return (
            <Animated.View
              key={i}
              style={[
                { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.indigo.light, marginHorizontal: 2 },
                s,
              ]}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const ty = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
});

// ─── Voice Recording Button ───────────────────────────────────────────────────

const RecordButton: React.FC<{
  onStartRecord: () => void;
  onStopRecord: () => void;
  isRecording: boolean;
}> = ({ onStartRecord, onStopRecord, isRecording }) => {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
      ripple.value = withRepeat(withTiming(1, { duration: 1000 }), -1, false);
    } else {
      scale.value = withSpring(1);
      ripple.value = 0;
    }
  }, [isRecording]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ripple.value, [0, 0.5, 1], [0.5, 0.2, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(ripple.value, [0, 1], [1, 2], Extrapolation.CLAMP) }],
  }));

  return (
    <Pressable
      onLongPress={onStartRecord}
      onPressOut={isRecording ? onStopRecord : undefined}
      delayLongPress={200}
    >
      <View style={rb.wrap}>
        {isRecording && (
          <Animated.View style={[rb.ripple, rippleStyle]} />
        )}
        <Animated.View style={btnStyle}>
          <LinearGradient
            colors={isRecording ? ["#EF4444", "#DC2626"] : [COLORS.indigo.dark, COLORS.indigo.primary]}
            style={rb.btn}
          >
            <Text style={{ fontSize: 18 }}>{isRecording ? "⏹" : "🎤"}</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const rb = StyleSheet.create({
  wrap: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  ripple: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Input Bar ────────────────────────────────────────────────────────────────

const InputBar: React.FC<{
  onSend: (text: string) => void;
  replyTo: Message["replyTo"] | null;
  onCancelReply: () => void;
  onVoiceNote: () => void;
}> = ({ onSend, replyTo, onCancelReply, onVoiceNote }) => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendScale = useSharedValue(1);

  const hasText = text.trim().length > 0;

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const handleSend = () => {
    if (!text.trim()) return;
    sendScale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 10 })
    );
    onSend(text.trim());
    setText("");
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordTimer.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    // TODO: wire expo-av recording here
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordTimer.current) clearInterval(recordTimer.current);
    onVoiceNote();
    // TODO: send voice note file
  };

  return (
    <View style={ib.wrap}>
      {replyTo && <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />}

      <View style={ib.bar}>
        {/* Attachment */}
        <TouchableOpacity style={ib.iconBtn}>
          <Text style={{ fontSize: 20 }}>📎</Text>
        </TouchableOpacity>

        {/* Text input */}
        <View style={ib.inputWrap}>
          {isRecording ? (
            <View style={ib.recordingRow}>
              <View style={ib.recordingDot} />
              <Text style={ib.recordingText}>
                Recording… {formatVoiceDuration(recordingSeconds)}
              </Text>
            </View>
          ) : (
            <TextInput
              style={ib.input}
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              placeholderTextColor={COLORS.text.disabled}
              multiline
              maxLength={2000}
              selectionColor={COLORS.indigo.primary}
              onSubmitEditing={handleSend}
            />
          )}
        </View>

        {/* Emoji */}
        {!isRecording && !hasText && (
          <TouchableOpacity style={ib.iconBtn}>
            <Text style={{ fontSize: 20 }}>😊</Text>
          </TouchableOpacity>
        )}

        {/* Send or mic */}
        {hasText ? (
          <Animated.View style={sendStyle}>
            <TouchableOpacity onPress={handleSend} style={ib.sendBtn}>
              <LinearGradient
                colors={[COLORS.indigo.dark, COLORS.indigo.primary]}
                style={ib.sendGrad}
              >
                <Text style={{ fontSize: 16, color: "#fff" }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <RecordButton
            isRecording={isRecording}
            onStartRecord={startRecording}
            onStopRecord={stopRecording}
          />
        )}
      </View>
    </View>
  );
};

const ib = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: COLORS.text.primary,
    maxHeight: 100,
    lineHeight: 21,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  recordingText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  sendBtn: {},
  sendGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Header ───────────────────────────────────────────────────────────────────

const ChatHeader: React.FC<{
  user: ChatUser;
  isTyping: boolean;
  onBack: () => void;
  onVideoCall: () => void;
  onVoiceCall: () => void;
  onInfo: () => void;
}> = ({ user, isTyping, onBack, onVideoCall, onVoiceCall, onInfo }) => (
  <View style={ch.wrap}>
    <TouchableOpacity onPress={onBack} style={ch.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={ch.backText}>‹</Text>
    </TouchableOpacity>

    <TouchableOpacity style={ch.centerRow} onPress={onInfo} activeOpacity={0.8}>
      <View style={ch.avatarWrap}>
        <LinearGradient colors={user.avatarColor} style={ch.avatar}>
          <Text style={ch.avatarText}>{user.initial}</Text>
        </LinearGradient>
        {user.isOnline && <View style={ch.onlineDot} />}
      </View>
      <View>
        <Text style={ch.name}>{user.name}</Text>
        <Text style={ch.status}>
          {isTyping ? (
            <Text style={{ color: COLORS.indigo.light }}>typing…</Text>
          ) : user.isOnline ? (
            <Text style={{ color: "#22C55E" }}>● Online</Text>
          ) : (
            `Last seen ${user.lastSeen ?? "recently"}`
          )}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={ch.actions}>
  <TouchableOpacity
    style={ch.actionBtn}
    onPress={onVoiceCall}
  >
    <Phone
      size={20}
      color={COLORS.text.primary}
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={ch.actionBtn}
    onPress={onVideoCall}
  >
    <Video
      size={20}
      color={COLORS.text.primary}
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={ch.actionBtn}
    onPress={onInfo}
  >
    <MoreVertical
      size={20}
      color={COLORS.text.primary}
    />
  </TouchableOpacity>
</View>
  </View>
);

const ch = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 8,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 32,
    color: COLORS.indigo.light,
    lineHeight: 36,
    fontWeight: "300",
  },
  centerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: COLORS.bg.secondary,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
    letterSpacing: -0.2,
  },
  status: { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },
  actions: { flexDirection: "row", gap: 2 },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Main Chat Screen ─────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const chatUser = MOCK_CHAT_USERS[id ?? "1"] ?? MOCK_CHAT_USERS["1"];

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message["replyTo"] | null>(null);

  // Simulate partner typing
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 3000);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      // Simulate incoming message
      const incoming: Message = {
        id: Date.now().toString(),
        text: "By the way, are you free this afternoon?",
        senderId: chatUser.id,
        receiverId: "me",
        timestamp: new Date().toISOString(),
        status: "delivered",
        type: "text",
      };
      setMessages((prev) => [...prev, incoming]);
    }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = useCallback((text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      text,
      senderId: "me",
      receiverId: chatUser.id,
      timestamp: new Date().toISOString(),
      status: "sending",
      type: "text",
      replyTo: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, msg]);
    setReplyTo(null);

    // Simulate status progression
    // TODO: replace with WebSocket STOMP delivery receipt
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, status: "sent" } : m)
      );
    }, 600);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, status: "delivered" } : m)
      );
    }, 1400);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, status: "read" } : m)
      );
    }, 3000);
  }, [replyTo, chatUser.id]);

  const handleVoiceNote = useCallback(() => {
    const msg: Message = {
      id: Date.now().toString(),
      text: "",
      senderId: "me",
      receiverId: chatUser.id,
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "voice",
      voiceDuration: 8,
    };
    setMessages((prev) => [...prev, msg]);
  }, [chatUser.id]);

  const handleReact = useCallback((msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions ?? [];
        const already = existing.findIndex((r) => r.userId === "me" && r.emoji === emoji);
        if (already > -1) {
          return { ...m, reactions: existing.filter((_, i) => i !== already) };
        }
        return { ...m, reactions: [...existing, { emoji, userId: "me" }] };
      })
    );
  }, []);

  const handleDelete = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, isDeleted: true } : m)
    );
  }, []);

  const handleReply = useCallback((msg: Message) => {
    setReplyTo({
      id: msg.id,
      text: msg.type === "voice" ? `Voice message · ${formatVoiceDuration(msg.voiceDuration ?? 0)}` : msg.text,
      senderName: msg.senderId === "me" ? "You" : chatUser.name,
    });
  }, [chatUser.name]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === "me";
    const isLast = index === messages.length - 1;
    const nextMsg = messages[index + 1];
    const showAvatar = !isMe && (!nextMsg || nextMsg.senderId !== item.senderId);

    return (
      <View>
        {shouldShowDate(messages, index) && (
          <DateSeparator date={formatDate(item.timestamp)} />
        )}
        <MessageBubble
          message={item}
          isMe={isMe}
          showAvatar={showAvatar}
          chatUser={chatUser}
          onReply={handleReply}
          onReact={handleReact}
          onDelete={handleDelete}
        />
      </View>
    );
  }, [messages, chatUser, handleReply, handleReact, handleDelete]);

  return (
    <SafeAreaView style={main.root} edges={["top"]}>
      <ChatHeader
        user={chatUser}
        isTyping={isTyping}
        onBack={() => router.back()}
        onVideoCall={() => Alert.alert("Video Call", "Coming in Phase 3")}
        onVoiceCall={() => Alert.alert("Voice Call", "Coming in Phase 3")}
        onInfo={() => Alert.alert("Chat Info", "Coming in Phase 3")}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={main.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListFooterComponent={
            isTyping ? <TypingIndicator user={chatUser} /> : null
          }
        />

        <InputBar
          onSend={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onVoiceNote={handleVoiceNote}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const main = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg.primary },
  list: { paddingVertical: 12, paddingBottom: 8 },
});