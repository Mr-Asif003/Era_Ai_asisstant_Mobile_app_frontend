import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInUp,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Mic,
  MicOff,
  MessageSquare,
  Radio,
  Send,
  X,
  Trash2,
  ChevronRight,
  Sparkles,
  Volume2,
  Search,
  Mail,
  BookOpen,
  Users,
  Bell,
  Zap,
  RotateCcw,
} from "lucide-react-native";

const { width: W } = Dimensions.get("window");

// ─── Era color palette ────────────────────────────────────────────────────────
const E = {
  bg0:       "#0D0A12",
  bg1:       "#120D1A",
  bg2:       "#1A1025",
  bg3:       "#221430",
  pink:      "#F472B6",
  pinkDark:  "#DB2777",
  pinkLight: "#FBCFE8",
  rose:      "#FB7185",
  violet:    "#A78BFA",
  purple:    "#7C3AED",
  lilac:     "#DDD6FE",
  text:      "#FDF2F8",
  muted:     "rgba(253,242,248,0.55)",
  dim:       "rgba(253,242,248,0.28)",
  border:    "rgba(244,114,182,0.15)",
  borderHi:  "rgba(244,114,182,0.45)",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type EraMode = "idle" | "listening" | "thinking" | "speaking";
type AppMode = "text" | "voice";
type MsgRole = "user" | "era";

interface EraMessage {
  id: string;
  role: MsgRole;
  text: string;
  timestamp: Date;
  action?: EraAction;
  isVoice?: boolean;
}

interface EraAction {
  type: "navigate" | "summary" | "search" | "read" | "compose";
  label: string;
  payload?: string;
}

// ─── Command parser ───────────────────────────────────────────────────────────

function parseCommand(input: string): { reply: string; action?: EraAction } {
  const t = input.toLowerCase().trim();
  if (t.includes("unread") || t.includes("read my messages") || t.includes("new messages")) {
    return {
      reply: "You have 3 unread messages 📩\n\n• Alex Chen sent a voice note\n• Design Team has 7 new messages\n• Jordan Lee is waiting on your reply\n\nWant me to read them aloud?",
      action: { type: "read", label: "Read messages", payload: "unread" },
    };
  }
  if (t.includes("summarize") || t.includes("summarise") || t.includes("summary") || t.includes("catch me up") || t.includes("catch up")) {
    return {
      reply: "Here's your morning catch-up ✨\n\n• Alex is asking about the project deadline\n• Maya needs design feedback before EOD\n• Sam confirmed the Thursday standup\n\nAny of these need urgent attention?",
      action: { type: "summary", label: "View full summary" },
    };
  }
  if (t.includes("send") || t.includes("message") || t.includes("tell")) {
    const nameMatch = t.match(/(?:send|message|tell)\s+(\w+)/);
    const name = nameMatch?.[1] ?? "them";
    return {
      reply: `Sure! I'll open a chat with ${name} 💬 What would you like to say?`,
      action: { type: "compose", label: `Message ${name}`, payload: name },
    };
  }
  if (t.includes("search") || t.includes("find")) {
    const query = t.replace(/search|find/g, "").trim();
    return {
      reply: `Searching for "${query}" across your conversations… Found 4 results. Shall I show them?`,
      action: { type: "search", label: "Show results", payload: query },
    };
  }
  if (t.includes("open chats") || t.includes("go to chats") || t.includes("chats")) {
    return {
      reply: "Opening your chats right away 💬",
      action: { type: "navigate", label: "Go to Chats", payload: "/(tabs)/chats" },
    };
  }
  if (t.includes("contacts")) {
    return {
      reply: "Taking you to contacts ✨",
      action: { type: "navigate", label: "Go to Contacts", payload: "/(tabs)/contacts" },
    };
  }
  if (t.includes("daily digest") || t.includes("digest") || t.includes("brief")) {
    return {
      reply: "Your daily digest for today 📋\n\n• 12 messages received\n• 3 voice notes\n• 2 group updates\n• 1 missed call from Jordan\n\nOverall a busy morning! Want me to prioritise anything?",
      action: { type: "summary", label: "Full digest" },
    };
  }
  if (t.includes("who's online") || t.includes("who is online") || t.includes("online")) {
    return {
      reply: "Currently online 🟢\n\n• Alex Chen — active now\n• Jordan Lee — active 2m ago\n• Era AI — always here for you ✦",
    };
  }
  if (t.includes("hello") || t.includes("hi") || t.includes("hey era") || t.includes("hey")) {
    return {
      reply: "Hey there! I'm Era 🌸\n\nI'm your personal AI companion. I can read your messages, summarise conversations, send messages for you, search your chats, and help you stay on top of everything.\n\nWhat do you need today?",
    };
  }
  if (t.includes("who are you") || t.includes("what can you do") || t.includes("help")) {
    return {
      reply: "I'm Era 🌸 — your intelligent chat companion!\n\nHere's what I can do:\n• 📩 Read & summarise messages\n• 📤 Send messages for you\n• 🔍 Search chats & contacts\n• 🗓️ Give daily digests\n• 🧭 Navigate the app\n• 🎤 Respond to voice commands\n\nJust talk to me naturally!",
    };
  }
  if (t.includes("thank")) {
    return { reply: "Always here for you 🌸 Is there anything else you need?" };
  }
  return {
    reply: "I heard you 💭 I'm still learning that one! Try asking me to:\n• Read your messages\n• Summarise a conversation\n• Send someone a message\n• Search for something",
  };
}

// ─── Wave Bar ─────────────────────────────────────────────────────────────────

const WaveBar: React.FC<{ index: number; mode: EraMode; totalBars: number }> = ({
  index,
  mode,
  totalBars,
}) => {
  const h = useSharedValue(3);
  const active = mode === "listening" || mode === "speaking";

  useEffect(() => {
    if (active) {
      const center = totalBars / 2;
      const distFromCenter = Math.abs(index - center) / center;
      const maxH = 40 - distFromCenter * 20;
      const dur = 300 + Math.random() * 400;
      h.value = withRepeat(
        withSequence(
          withTiming(maxH, { duration: dur }),
          withTiming(3, { duration: dur })
        ),
        -1,
        false
      );
    } else if (mode === "thinking") {
      const dur = 500 + index * 30;
      h.value = withRepeat(
        withSequence(
          withTiming(10, { duration: dur }),
          withTiming(3, { duration: dur })
        ),
        -1,
        false
      );
    } else {
      h.value = withTiming(3, { duration: 500 });
    }
  }, [mode]);

  const style = useAnimatedStyle(() => ({
    height: h.value,
    opacity: interpolate(h.value, [3, 40], [0.25, 1], Extrapolation.CLAMP),
  }));

  const color =
    mode === "listening" ? E.pink
    : mode === "speaking" ? E.violet
    : mode === "thinking" ? E.rose
    : "rgba(244,114,182,0.2)";

  return (
    <Animated.View
      style={[
        { width: 3, borderRadius: 3, marginHorizontal: 1.5, backgroundColor: color },
        style,
      ]}
    />
  );
};

// ─── Ripple ───────────────────────────────────────────────────────────────────

const Ripple: React.FC<{ delay: number; active: boolean; color: string }> = ({
  delay,
  active,
  color,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: delay }),
          withTiming(2.4, { duration: 1800 })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: delay }),
          withTiming(0, { duration: 1800 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: 55,
          borderWidth: 1.5,
          borderColor: color,
        },
        style,
      ]}
    />
  );
};

// ─── Era Orb ─────────────────────────────────────────────────────────────────

const EraOrb: React.FC<{ mode: EraMode; size?: number }> = ({ mode, size = 110 }) => {
  const breathe = useSharedValue(1);
  const rot = useSharedValue(0);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0.3, { duration: 1800 })
      ),
      -1,
      true
    );
    rot.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const rotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const orbColors: [string, string, string] =
    mode === "listening" ? ["#9D174D", "#DB2777", "#F472B6"]
    : mode === "thinking"  ? ["#4C1D95", "#7C3AED", "#A78BFA"]
    : mode === "speaking"  ? ["#831843", "#DB2777", "#A78BFA"]
    : ["#831843", "#DB2777", "#F472B6"];

  const rippleColor =
    mode === "listening" ? "rgba(244,114,182,0.4)"
    : mode === "thinking" ? "rgba(167,139,250,0.4)"
    : "rgba(244,114,182,0.3)";

  const active = mode !== "idle";

  return (
    <View style={{ width: size + 60, height: size + 60, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            backgroundColor: "rgba(219,39,119,0.12)",
          },
          glowStyle,
        ]}
      />
      <Ripple delay={0} active={active} color={rippleColor} />
      <Ripple delay={600} active={active} color={rippleColor} />

      <Animated.View
        style={[
          {
            position: "absolute",
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderWidth: 1,
            borderColor: "transparent",
            borderTopColor: E.pink,
            borderRightColor: E.violet,
          },
          rotStyle,
        ]}
      />

      <Animated.View style={breatheStyle}>
        <LinearGradient
          colors={orbColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={size * 0.38} color="#fff" strokeWidth={1.5} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// ─── Mode Switch Toggle ───────────────────────────────────────────────────────

const ModeSwitcher: React.FC<{
  appMode: AppMode;
  onChange: (m: AppMode) => void;
}> = ({ appMode, onChange }) => {
  const slideX = useSharedValue(appMode === "text" ? 0 : 1);

  useEffect(() => {
    slideX.value = withSpring(appMode === "text" ? 0 : 1, {
      damping: 16,
      stiffness: 200,
    });
  }, [appMode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(slideX.value, [0, 1], [2, 98], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View style={ms.wrap}>
      {/* Sliding indicator */}
      <Animated.View style={[ms.indicator, indicatorStyle]}>
        <LinearGradient
          colors={[E.pinkDark, E.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={ms.indicatorGrad}
        />
      </Animated.View>

      {/* Text mode tab */}
      <TouchableOpacity
        style={ms.tab}
        onPress={() => onChange("text")}
        activeOpacity={0.8}
      >
        <MessageSquare
          size={15}
          color={appMode === "text" ? "#fff" : E.dim}
          strokeWidth={2}
        />
        <Text style={[ms.tabText, appMode === "text" && ms.tabTextActive]}>
          Text
        </Text>
      </TouchableOpacity>

      {/* Voice mode tab */}
      <TouchableOpacity
        style={ms.tab}
        onPress={() => onChange("voice")}
        activeOpacity={0.8}
      >
        <Radio
          size={15}
          color={appMode === "voice" ? "#fff" : E.dim}
          strokeWidth={2}
        />
        <Text style={[ms.tabText, appMode === "voice" && ms.tabTextActive]}>
          Voice
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ms = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: E.bg2,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: E.border,
    position: "relative",
    width: 200,
  },
  indicator: {
    position: "absolute",
    top: 2,
    left: 0,
    width: 98,
    height: "100%",
    borderRadius: 11,
    overflow: "hidden",
  },
  indicatorGrad: {
    flex: 1,
    borderRadius: 11,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: E.dim,
  },
  tabTextActive: {
    color: "#fff",
  },
});

// ─── Header ───────────────────────────────────────────────────────────────────

const EraHeader: React.FC<{
  appMode: AppMode;
  onModeChange: (m: AppMode) => void;
  onClear: () => void;
  hasMessages: boolean;
}> = ({ appMode, onModeChange, onClear, hasMessages }) => (
  <View style={hd.wrap}>
    <View style={hd.left}>
      <LinearGradient colors={[E.pinkDark, E.violet]} style={hd.badge}>
        <Sparkles size={10} color="#fff" />
        <Text style={hd.badgeText}>ERA</Text>
      </LinearGradient>
      <View>
        <Text style={hd.name}>Era</Text>
        <Text style={hd.sub}>AI Assistant · Always on</Text>
      </View>
    </View>
    {hasMessages && (
      <TouchableOpacity style={hd.clearBtn} onPress={onClear}>
        <RotateCcw size={14} color={E.muted} strokeWidth={2} />
        <Text style={hd.clearText}>Clear</Text>
      </TouchableOpacity>
    )}
  </View>
);

const hd = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: E.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  name: { fontSize: 17, fontWeight: "700", color: E.text, letterSpacing: -0.3 },
  sub: { fontSize: 12, color: E.muted, marginTop: 1 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: E.bg2,
    borderWidth: 1,
    borderColor: E.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  clearText: { fontSize: 13, color: E.muted, fontWeight: "500" },
});

// ─── Quick chips ──────────────────────────────────────────────────────────────

const CHIPS = [
  { icon: Mail,     label: "Read unread" },
  { icon: Sparkles, label: "Catch me up" },
  { icon: Search,   label: "Search chats" },
  { icon: Send,     label: "Send message" },
  { icon: BookOpen, label: "Daily digest" },
  { icon: Users,    label: "Who's online?" },
];

const QuickChips: React.FC<{ onSelect: (t: string) => void }> = ({ onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={qc.row}
  >
    {CHIPS.map(({ icon: Icon, label }) => (
      <TouchableOpacity
        key={label}
        style={qc.chip}
        onPress={() => onSelect(label)}
        activeOpacity={0.75}
      >
        <Icon size={13} color={E.pink} strokeWidth={2} />
        <Text style={qc.label}>{label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const qc = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: E.bg2,
    borderWidth: 1,
    borderColor: E.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: { fontSize: 12, color: E.muted, fontWeight: "500" },
});

// ─── Chat bubble ──────────────────────────────────────────────────────────────

const EraBubble: React.FC<{
  msg: EraMessage;
  onAction: (a: EraAction) => void;
}> = ({ msg, onAction }) => {
  const isEra = msg.role === "era";

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={[bb.row, isEra ? bb.rowEra : bb.rowUser]}
    >
      {isEra && (
        <LinearGradient colors={[E.pinkDark, E.pink]} style={bb.avatar}>
          <Sparkles size={11} color="#fff" strokeWidth={2} />
        </LinearGradient>
      )}

      <View style={[bb.bubble, isEra ? bb.bubbleEra : bb.bubbleUser]}>
        {msg.isVoice && (
          <View style={bb.voiceTag}>
            <Mic size={10} color={E.pink} strokeWidth={2} />
            <Text style={bb.voiceTagText}>Voice</Text>
          </View>
        )}

        <Text style={[bb.text, isEra ? bb.textEra : bb.textUser]}>{msg.text}</Text>

        {isEra && msg.action && (
          <TouchableOpacity
            style={bb.actionBtn}
            onPress={() => onAction(msg.action!)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[E.pinkDark, E.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={bb.actionGrad}
            >
              <Text style={bb.actionText}>{msg.action.label}</Text>
              <ChevronRight size={13} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={bb.time}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </Animated.View>
  );
};

const bb = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 4, paddingHorizontal: 16, gap: 8 },
  rowEra: { alignItems: "flex-end" },
  rowUser: { justifyContent: "flex-end" },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: W * 0.74,
    borderRadius: 20,
    padding: 13,
    gap: 6,
  },
  bubbleEra: {
    backgroundColor: E.bg2,
    borderWidth: 1,
    borderColor: E.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#831843",
    borderBottomRightRadius: 4,
  },
  voiceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  voiceTagText: { fontSize: 10, color: E.pink, fontWeight: "600" },
  text: { fontSize: 14, lineHeight: 21 },
  textEra: { color: E.text },
  textUser: { color: "#fff" },
  time: { fontSize: 10, color: "rgba(253,242,248,0.3)", alignSelf: "flex-end" },
  actionBtn: { marginTop: 4, borderRadius: 10, overflow: "hidden" },
  actionGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: "#fff" },
});

// ─── Thinking indicator ───────────────────────────────────────────────────────

const ThinkingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(delay, { duration: 0 }),
        withTiming(-7, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      style={[
        { width: 7, height: 7, borderRadius: 4, backgroundColor: E.violet, marginHorizontal: 2.5 },
        style,
      ]}
    />
  );
};

// ─── Text Mode Input ──────────────────────────────────────────────────────────

const TextModeInput: React.FC<{
  onSend: (t: string) => void;
  disabled: boolean;
  onChipSelect: (t: string) => void;
}> = ({ onSend, disabled, onChipSelect }) => {
  const [text, setText] = useState("");
  const sendScale = useSharedValue(1);
  const hasText = text.trim().length > 0;

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    sendScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1, { damping: 10 })
    );
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={ti.wrap}>
      <QuickChips onSelect={onChipSelect} />
      <View style={ti.bar}>
        <View style={ti.inputWrap}>
          <TextInput
            style={ti.input}
            value={text}
            onChangeText={setText}
            placeholder="Ask Era anything…"
            placeholderTextColor={E.dim}
            multiline
            maxLength={500}
            selectionColor={E.pink}
            editable={!disabled}
            onSubmitEditing={handleSend}
          />
        </View>
        <Animated.View style={sendStyle}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!hasText || disabled}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={hasText && !disabled ? [E.pinkDark, E.pink] : [E.bg3, E.bg2]}
              style={ti.sendBtn}
            >
              <Send
                size={18}
                color={hasText && !disabled ? "#fff" : E.dim}
                strokeWidth={2}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const ti = StyleSheet.create({
  wrap: {
    backgroundColor: E.bg1,
    borderTopWidth: 1,
    borderTopColor: E.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: E.bg2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: E.border,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
    minHeight: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: E.text,
    maxHeight: 100,
    lineHeight: 21,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Voice Mode UI ────────────────────────────────────────────────────────────

const VoiceModeUI: React.FC<{
  eraMode: EraMode;
  isListening: boolean;
  recordSeconds: number;
  onMicPress: () => void;
  onChipSelect: (t: string) => void;
}> = ({ eraMode, isListening, recordSeconds, onMicPress, onChipSelect }) => {
  const BARS = 36;

  const statusConfig = {
    idle:      { text: 'Say "Hey Era" or tap the mic', color: E.muted },
    listening: { text: "Listening…",                   color: E.pink },
    thinking:  { text: "Era is thinking…",             color: E.violet },
    speaking:  { text: "Era is responding…",           color: E.lilac },
  };

  const { text, color } = statusConfig[eraMode];

  const micBounce = useSharedValue(1);
  useEffect(() => {
    if (isListening) {
      micBounce.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      micBounce.value = withSpring(1);
    }
  }, [isListening]);

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micBounce.value }],
  }));

  return (
    <View style={vm.wrap}>
      {/* Era orb */}
      <EraOrb mode={eraMode} size={120} />

      {/* Status */}
      <Animated.Text key={eraMode} entering={FadeIn.duration(300)} style={[vm.status, { color }]}>
        {text}
      </Animated.Text>

      {/* Waveform */}
      <View style={vm.waveRow}>
        {Array.from({ length: BARS }).map((_, i) => (
          <WaveBar key={i} index={i} mode={eraMode} totalBars={BARS} />
        ))}
      </View>

      {/* Recording timer */}
      {isListening && (
        <Animated.View entering={FadeIn.duration(200)} style={vm.timerRow}>
          <View style={vm.recDot} />
          <Text style={vm.timerText}>
            Recording · {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:
            {String(recordSeconds % 60).padStart(2, "0")}
          </Text>
        </Animated.View>
      )}

      {/* Mic button */}
      <Animated.View style={micStyle}>
        <TouchableOpacity onPress={onMicPress} activeOpacity={0.85}>
          <LinearGradient
            colors={isListening ? ["#9D174D", E.rose] : [E.pinkDark, E.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={vm.micBtn}
          >
            {isListening ? (
              <MicOff size={30} color="#fff" strokeWidth={2} />
            ) : (
              <Mic size={30} color="#fff" strokeWidth={2} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Text style={vm.micHint}>
        {isListening ? "Tap to stop" : "Hold or tap to speak"}
      </Text>

      {/* Quick chips */}
      <View style={{ width: "100%", marginTop: 8 }}>
        <Text style={vm.chipsLabel}>Quick commands</Text>
        <QuickChips onSelect={onChipSelect} />
      </View>
    </View>
  );
};

const vm = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  status: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: "100%",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(244,114,182,0.1)",
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: E.pink,
  },
  timerText: { fontSize: 13, color: E.pink, fontWeight: "600" },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: E.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  micHint: { fontSize: 12, color: E.dim, fontWeight: "500" },
  chipsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: E.dim,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});

// ─── Hero (empty text mode) ───────────────────────────────────────────────────

const TextModeHero: React.FC<{ onChipSelect: (t: string) => void }> = ({
  onChipSelect,
}) => {
  const o = useSharedValue(0);
  const y = useSharedValue(20);
  useEffect(() => {
    o.value = withTiming(1, { duration: 600 });
    y.value = withSpring(0, { damping: 14 });
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));

  const CAPS = [
    { Icon: Mail,      text: "Read messages" },
    { Icon: Sparkles,  text: "Summarise chats" },
    { Icon: Send,      text: "Send for you" },
    { Icon: Search,    text: "Search everything" },
    { Icon: Bell,      text: "Daily digest" },
    { Icon: Zap,       text: "Quick actions" },
  ];

  return (
    <Animated.View style={[th.wrap, style]}>
      <EraOrb mode="idle" size={100} />

      <View style={th.textBlock}>
        <Text style={th.title}>Hello, I'm Era 🌸</Text>
        <Text style={th.sub}>Your personal AI companion.{"\n"}Type anything or pick a suggestion.</Text>
      </View>

      <View style={th.capsGrid}>
        {CAPS.map(({ Icon, text }) => (
          <TouchableOpacity
            key={text}
            style={th.cap}
            onPress={() => onChipSelect(text)}
            activeOpacity={0.75}
          >
            <Icon size={15} color={E.pink} strokeWidth={2} />
            <Text style={th.capText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const th = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 24,
  },
  textBlock: { alignItems: "center", gap: 8 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: E.text,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  sub: {
    fontSize: 15,
    color: E.muted,
    textAlign: "center",
    lineHeight: 23,
  },
  capsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  cap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: E.bg2,
    borderWidth: 1,
    borderColor: E.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  capText: { fontSize: 13, color: E.muted, fontWeight: "500" },
});

// ─── Main Era Screen ──────────────────────────────────────────────────────────

export default function EraScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [appMode, setAppMode] = useState<AppMode>("text");
  const [eraMode, setEraMode] = useState<EraMode>("idle");
  const [messages, setMessages] = useState<EraMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  const addMessage = (
    role: MsgRole,
    text: string,
    action?: EraAction,
    isVoice?: boolean
  ) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + role, role, text, timestamp: new Date(), action, isVoice },
    ]);
  };

  const processInput = useCallback(
    (text: string, isVoice = false) => {
      addMessage("user", text, undefined, isVoice);
      setEraMode("thinking");
      setTimeout(() => {
        setEraMode("speaking");
        const { reply, action } = parseCommand(text);
        addMessage("era", reply, action);
        setTimeout(() => setEraMode("idle"), 2000);
      }, 1200);
    },
    []
  );

  const handleSend = useCallback(
    (text: string) => processInput(text, false),
    [processInput]
  );

  const handleChipSelect = useCallback(
    (label: string) => processInput(label, false),
    [processInput]
  );

  const handleMicPress = () => {
    if (isListening) {
      setIsListening(false);
      setEraMode("thinking");
      if (recordTimer.current) clearInterval(recordTimer.current);
      setTimeout(() => {
        const mockSTT = "Read my unread messages";
        processInput(`🎤 "${mockSTT}"`, true);
      }, 500);
    } else {
      setIsListening(true);
      setEraMode("listening");
      setRecordSeconds(0);
      recordTimer.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleModeSwitch = (m: AppMode) => {
    setAppMode(m);
    if (isListening) {
      setIsListening(false);
      setEraMode("idle");
      if (recordTimer.current) clearInterval(recordTimer.current);
    }
  };

  const handleActionPress = (action: EraAction) => {
    if (action.type === "navigate" && action.payload) {
      router.push(action.payload as any);
    } else if (action.type === "compose") {
      router.push("/(tabs)/chats");
    } else if (action.type === "search") {
      router.push("/(tabs)/chats");
    } else {
      processInput(`Tell me more about ${action.label}`);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setEraMode("idle");
    setIsListening(false);
    if (recordTimer.current) clearInterval(recordTimer.current);
  };

  const showMessages = messages.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: E.bg0 }}>
      {/* Ambient blobs */}
      <View
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: "rgba(219,39,119,0.07)",
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: "absolute",
          bottom: 120,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(124,58,237,0.06)",
        }}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <EraHeader
          appMode={appMode}
          onModeChange={handleModeSwitch}
          onClear={handleClear}
          hasMessages={showMessages}
        />

        {/* Mode switcher */}
        <View style={{ alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: E.border }}>
          <ModeSwitcher appMode={appMode} onChange={handleModeSwitch} />
          <Text style={{ fontSize: 11, color: E.dim, marginTop: 8 }}>
            {appMode === "voice"
              ? '🎤 Say "Hey Era" or tap the mic to speak'
              : '💬 Type a message or pick a suggestion'}
          </Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* ── VOICE MODE ── */}
          {appMode === "voice" && (
            <>
              {showMessages ? (
                <View style={{ flex: 1 }}>
                  {/* Compact orb row */}
                  <View style={{
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: E.border,
                    gap: 8,
                  }}>
                    <EraOrb mode={eraMode} size={70} />
                    <Animated.Text
                      key={eraMode}
                      entering={FadeIn.duration(250)}
                      style={{
                        fontSize: 13,
                        color:
                          eraMode === "listening" ? E.pink
                          : eraMode === "thinking" ? E.violet
                          : eraMode === "speaking" ? E.lilac
                          : E.muted,
                        fontWeight: "500",
                      }}
                    >
                      {eraMode === "idle" ? "Tap mic to speak"
                        : eraMode === "listening" ? "Listening…"
                        : eraMode === "thinking" ? "Thinking…"
                        : "Speaking…"}
                    </Animated.Text>

                    {/* Waveform */}
                    <View style={{ flexDirection: "row", alignItems: "center", height: 30, width: "80%" }}>
                      {Array.from({ length: 28 }).map((_, i) => (
                        <WaveBar key={i} index={i} mode={eraMode} totalBars={28} />
                      ))}
                    </View>

                    {/* Mic button compact */}
                    <TouchableOpacity onPress={handleMicPress} activeOpacity={0.85}>
                      <LinearGradient
                        colors={isListening ? ["#9D174D", E.rose] : [E.pinkDark, E.violet]}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isListening ? (
                          <MicOff size={22} color="#fff" strokeWidth={2} />
                        ) : (
                          <Mic size={22} color="#fff" strokeWidth={2} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Messages */}
                  <ScrollView
                    ref={scrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingVertical: 12 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {messages.map((msg) => (
                      <EraBubble key={msg.id} msg={msg} onAction={handleActionPress} />
                    ))}
                    {eraMode === "thinking" && (
                      <Animated.View
                        entering={FadeIn.duration(200)}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-end",
                          gap: 8,
                          paddingHorizontal: 16,
                          marginVertical: 4,
                        }}
                      >
                        <LinearGradient
                          colors={[E.pinkDark, E.pink]}
                          style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" }}
                        >
                          <Sparkles size={11} color="#fff" strokeWidth={2} />
                        </LinearGradient>
                        <View style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: E.bg2,
                          borderRadius: 18,
                          borderBottomLeftRadius: 4,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderWidth: 1,
                          borderColor: E.border,
                        }}>
                          <ThinkingDot delay={0} />
                          <ThinkingDot delay={150} />
                          <ThinkingDot delay={300} />
                        </View>
                      </Animated.View>
                    )}
                  </ScrollView>

                  {/* Bottom chips */}
                  <View style={{ borderTopWidth: 1, borderTopColor: E.border, paddingBottom: Platform.OS === "ios" ? 24 : 12, paddingTop: 8 }}>
                    <QuickChips onSelect={handleChipSelect} />
                  </View>
                </View>
              ) : (
                /* Voice mode hero */
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <VoiceModeUI
                    eraMode={eraMode}
                    isListening={isListening}
                    recordSeconds={recordSeconds}
                    onMicPress={handleMicPress}
                    onChipSelect={handleChipSelect}
                  />
                </ScrollView>
              )}
            </>
          )}

          {/* ── TEXT MODE ── */}
          {appMode === "text" && (
            <>
              {showMessages ? (
                <ScrollView
                  ref={scrollRef}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingVertical: 12 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {messages.map((msg) => (
                    <EraBubble key={msg.id} msg={msg} onAction={handleActionPress} />
                  ))}
                  {eraMode === "thinking" && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 8,
                        paddingHorizontal: 16,
                        marginVertical: 4,
                      }}
                    >
                      <LinearGradient
                        colors={[E.pinkDark, E.pink]}
                        style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" }}
                      >
                        <Sparkles size={11} color="#fff" strokeWidth={2} />
                      </LinearGradient>
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: E.bg2,
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderWidth: 1,
                        borderColor: E.border,
                      }}>
                        <ThinkingDot delay={0} />
                        <ThinkingDot delay={150} />
                        <ThinkingDot delay={300} />
                      </View>
                    </Animated.View>
                  )}
                </ScrollView>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextModeHero onChipSelect={handleChipSelect} />
                </ScrollView>
              )}

              <TextModeInput
                onSend={handleSend}
                disabled={eraMode === "thinking"}
                onChipSelect={handleChipSelect}
              />
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}