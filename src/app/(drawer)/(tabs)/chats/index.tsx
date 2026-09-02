import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
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
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useRouter } from "expo-router";
import { Bell, OptionIcon } from "lucide-react-native";
import {useAuthStore} from "@/stores/auth.store";
import {
  useConversations,
  useCreateDirectConversation,
} from "../../../../backend/conversation/useConversations";
import { conversationService } from "@/backend/conversation/conversation.service";
import ChatScreen from "./[id]";

const { width: W, height: H } = Dimensions.get("window");

// ─── Token system ─────────────────────────────────────────────────────────────
const T = {
  bg0:      "#05050F",   // deepest black
  bg1:      "#0A0A1A",   // surface
  bg2:      "#0F0F28",   // card
  bg3:      "#141432",   // elevated card
  border:   "rgba(99,102,241,0.12)",
  borderHi: "rgba(99,102,241,0.35)",
  indigo:   "#6366F1",
  indigoLt: "#818CF8",
  indigoXl: "#A5B4FC",
  violet:   "#7C3AED",
  pink:     "#EC4899",
  green:    "#22C55E",
  amber:    "#F59E0B",
  text:     "#F1F5F9",
  muted:    "rgba(241,245,249,0.45)",
  dimmed:   "rgba(241,245,249,0.22)",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
// const CHATS = [
//   {
//     id: "1",
//     name: "Mr.Asif",
//     avatar: "A",
//     avatarColors: ["#6366F1", "#8B5CF6"] as [string, string],
//     message: "Heard you! Sending the file now 📎",
//     time: "now",
//     unread: 3,
//     online: true,
//     typing: true,
//     pinned: true,
//     eraSummary: "Discussed project deadline & file sharing",
//     muted: false,
//     verified: true,
//   },
//   {
//     id: "2",
//     name: "Aamir",
//     avatar: "DT",
//     avatarColors: ["#EC4899", "#F43F5E"] as [string, string],
//     message: "Maya: The new components look 🔥",
//     time: "2m",
//     unread: 12,
//     online: false,
//     typing: false,
//     pinned: true,
//     eraSummary: "Figma handoff & review session planned",
//     muted: false,
//     verified: false,
//     isGroup: true,
//     memberCount: 8,
//   },
//   {
//     id: "3",
//     name: "Era AI ✦",
//     avatar: "✦",
//     avatarColors: ["#312E81", "#DB2777"] as [string, string],
//     message: "I summarised your morning — 4 action items",
//     time: "9m",
//     unread: 1,
//     online: true,
//     typing: false,
//     pinned: false,
//     eraSummary: null,
//     muted: false,
//     verified: true,
//     isEra: true,
//   },
//   {
//     id: "4",
//     name: "Ashab",
//     avatar: "J",
//     avatarColors: ["#F59E0B", "#EF4444"] as [string, string],
//     message: "🎙️ Voice note · 0:24",
//     time: "34m",
//     unread: 0,
//     online: true,
//     typing: false,
//     pinned: false,
//     eraSummary: null,
//     muted: false,
//     verified: false,
//   },
//   {
//     id: "5",
//     name: "Tarannum",
//     avatar: "M",
//     avatarColors: ["#10B981", "#059669"] as [string, string],
//     message: "Can we reschedule to Thursday?",
//     time: "1h",
//     unread: 0,
//     online: false,
//     typing: false,
//     pinned: false,
//     eraSummary: null,
//     muted: true,
//     verified: false,
//   },
//   {
//     id: "6",
//     name: "Era Daily Digest",
//     avatar: "✦",
//     avatarColors: ["#4338CA", "#7C3AED"] as [string, string],
//     message: "Your 8 AM brief is ready to read",
//     time: "8h",
//     unread: 0,
//     online: false,
//     typing: false,
//     pinned: false,
//     eraSummary: null,
//     muted: false,
//     verified: true,
//     isEra: true,
//   },
//   {
//     id: "7",
//     name: "Sam Rivera",
//     avatar: "S",
//     avatarColors: ["#0EA5E9", "#6366F1"] as [string, string],
//     message: "Thanks! Talk soon 👋",
//     time: "Yesterday",
//     unread: 0,
//     online: false,
//     typing: false,
//     pinned: false,
//     eraSummary: null,
//     muted: false,
//     verified: false,
//   },
// ];

const FILTERS = ["All", "Unread", "Groups", "Era AI", "Pinned"];

// ─── Animated presence dot ────────────────────────────────────────────────────
const OnlineDot: React.FC = () => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1, true
    );
  }, []);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.5], [0.7, 0], Extrapolation.CLAMP),
  }));
  return (
    <View style={s.onlineDotWrap}>
      <Animated.View style={[s.onlineDotRing, ringStyle]} />
      <View style={s.onlineDotCore} />
    </View>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => {
  const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  useEffect(() => {
    dots.forEach((d, i) => {
      d.value = withDelay(
        i * 160,
        withRepeat(
          withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })),
          -1, false
        )
      );
    });
  }, []);
  return (
    <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
      {dots.map((d, i) => {
        const style = useAnimatedStyle(() => ({ transform: [{ translateY: d.value }] }));
        return <Animated.View key={i} style={[s.typingDot, style]} />;
      })}
      <Text style={s.typingText}> typing</Text>
    </View>
  );
};

// ─── Era glow avatar (for Era chats) ─────────────────────────────────────────
const EraAvatar: React.FC<{ size?: number }> = ({ size = 52 }) => {
  const glow = useSharedValue(0.6);
  const rot = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0.6, { duration: 1800 })),
      -1, true
    );
    rot.value = withRepeat(withTiming(360, { duration: 8000 }), -1, false);
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: "rgba(99,102,241,0.2)",
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            borderWidth: 1,
            borderColor: "rgba(129,140,248,0.4)",
            borderStyle: "dashed",
          },
          rotStyle,
        ]}
      />
      <LinearGradient
        colors={["#312E81", "#4338CA", "#6366F1"]}
        style={{
          width: size, height: size, borderRadius: size / 2,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: size * 0.38, color: "#fff" }}>✦</Text>
      </LinearGradient>
    </View>
  );
};

// ─── Chat row ─────────────────────────────────────────────────────────────────
const ChatRow: React.FC<{
  chat: typeof CHATS[0];
  index: number;
  onPress: () => void;
}> = ({ chat, index, onPress }) => {
  const mountY = useSharedValue(30);
  const mountO = useSharedValue(0);
  const pressed = useSharedValue(0);
  const swipeX = useSharedValue(0);

  useEffect(() => {
    mountY.value = withDelay(index * 60, withSpring(0, { damping: 16, stiffness: 120 }));
    mountO.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
  }, []);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: mountO.value,
    transform: [{ translateY: mountY.value }, { translateX: swipeX.value }],
    backgroundColor: interpolate(
      pressed.value, [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ) > 0.5 ? "rgba(99,102,241,0.08)" : "transparent",
  }));

  const handlePressIn = () => { pressed.value = withTiming(1, { duration: 120 }); };
  const handlePressOut = () => { pressed.value = withTiming(0, { duration: 200 }); };

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98], Extrapolation.CLAMP) }],
  }));
  const handleDeleteById = async (id: string) => {
  try {
    await conversationService.remove(id);

    // Refresh the list

    Alert.alert("Success", "Conversation deleted");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to delete conversation");
  }
};

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[s.chatRow, rowStyle]}>
        <Animated.View style={scaleStyle}>
          <View style={s.chatRowInner}>
            {/* Avatar */}
            <View style={s.avatarWrap}>
              {chat.isEra ? (
                <EraAvatar size={52} />
              ) : (
                <LinearGradient colors={chat.avatarColors} style={s.avatar}>
                  <Text style={s.avatarText}>{chat.avatar}</Text>
                </LinearGradient>
              )}
              {chat.online && !chat.isEra && <OnlineDot />}
            </View>

            {/* Content */}
            <View style={s.chatContent}>
              <View style={s.chatTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1 }}>
                  {chat.pinned && <Text style={s.pinIcon}>📌</Text>}
                  <Text style={s.chatName} numberOfLines={1}>{chat.name}</Text>
                  {chat.verified && (
                    <View style={s.verifiedBadge}>
                      <Text style={{ fontSize: 8, color: T.indigoXl }}>✓</Text>
                    </View>
                  )}
                  {chat.isGroup && (
                    <View style={s.groupChip}>
                      <Text style={s.groupChipText}>{chat.memberCount}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {chat.muted && <Text style={{ fontSize: 12, opacity: 0.4 }}>🔇</Text>}
                  <Text style={s.chatTime}>{chat.time}</Text>
                </View>
              </View>

              <View style={s.chatBottomRow}>
                <View style={{ flex: 1 }}>
                  {chat.typing ? (
                    <TypingIndicator />
                  ) : (
                    <Text style={[s.chatMessage, chat.unread > 0 && s.chatMessageUnread]} numberOfLines={1}>
                      {chat.message}
                    </Text>
                  )}
                  {/* Era summary chip */}
                  {chat.eraSummary && (
                    <View style={s.eraSummaryChip}>
                      <Text style={s.eraSummaryIcon}>✦</Text>
                      <Text style={s.eraSummaryText} numberOfLines={1}>{chat.eraSummary}</Text>
                    </View>
                  )}
                </View>
                {chat.unread > 0 && (
                  <View style={[s.unreadBadge, chat.muted && s.unreadBadgeMuted]}>
                    <Text style={s.unreadText}>{chat.unread > 9 ? "9+" : chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={()=>handleDeleteById(chat.id)} >
              <OptionIcon size={40} color="rgba(241,245,249,0.4)" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

// ─── Era floating action bar ──────────────────────────────────────────────────
const EraFAB: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const expand = useSharedValue(0);
  const rot = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1, true
    );
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    expand.value = withSpring(next ? 1 : 0, { damping: 16, stiffness: 180 });
    rot.value = withSpring(next ? 45 : 0, { damping: 14 });
  };

  const optionStyle = (i: number) => useAnimatedStyle(() => ({
    opacity: expand.value,
    transform: [
      { translateY: interpolate(expand.value, [0, 1], [20, 0], Extrapolation.CLAMP) },
      { scale: interpolate(expand.value, [0, 1], [0.8, 1], Extrapolation.CLAMP) },
    ],
  }));

  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const OPTIONS = [
    // { icon: "✦", label: "Ask Era", color: ["#312E81", "#6366F1"] as [string, string],link:"" },
    { icon: "👥", label: "New", color: ["#7C3AED", "#6366F1"] as [string, string],link:"/chats/newbyEmail" },
    // { icon: "✉️", label: "New Chat by contact", color: ["#4338CA", "#6366F1"] as [string, string],link:"/chats/Contactscreen" },
  ];
  const handlePress = (link: string) => {
    router.push(link);
  }
  return (
    <View style={s.fabWrap}>
      {expanded && (
        <Pressable style={StyleSheet.absoluteFillObject} onPress={toggle} />
      )}
      {/* Options */}
      {OPTIONS.map((o, i) => (
        <Animated.View key={o.label} style={[s.fabOption, optionStyle(i), { bottom: 80 + i * 64 }]}>
          <TouchableOpacity style={s.fabOptionBtn} onPress={() => handlePress(o.link)}>
            <LinearGradient colors={o.color} style={s.fabOptionGrad}>
              <Text style={s.fabOptionIcon}>{o.icon}</Text>
            </LinearGradient>
            <View style={s.fabOptionLabel}>
              <Text style={s.fabOptionLabelText}>{o.label}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Main FAB */}
      <Animated.View style={[s.fabMain, pulseStyle]}>
        <TouchableOpacity onPress={toggle} activeOpacity={0.9}>
          <LinearGradient colors={["#4338CA", "#6366F1", "#818CF8"]} style={s.fabGrad}>
            <Animated.Text style={[s.fabIcon, rotStyle]}>✦</Animated.Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ─── Header search bar ────────────────────────────────────────────────────────
const SearchBar: React.FC<{ value: string; onChange: (t: string) => void }> = ({ value, onChange }) => {
  const focusAnim = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(99,102,241,${interpolate(focusAnim.value, [0, 1], [0.15, 0.6], Extrapolation.CLAMP)})`,
    backgroundColor: `rgba(15,15,40,${interpolate(focusAnim.value, [0, 1], [1, 1], Extrapolation.CLAMP)})`,
  }));

  return (
    <Animated.View style={[s.searchBar, barStyle]}>
      <Text style={s.searchIcon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search conversations…"
        placeholderTextColor={T.dimmed}
        style={s.searchInput}
        onFocus={() => { focusAnim.value = withTiming(1, { duration: 250 }); }}
        onBlur={() => { focusAnim.value = withTiming(0, { duration: 250 }); }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Text style={s.searchClear}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ─── Filter pill ──────────────────────────────────────────────────────────────
const FilterPill: React.FC<{ label: string; active: boolean; onPress: () => void; badge?: number }> = ({
  label, active, onPress, badge,
}) => {
  const anim = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    anim.value = withSpring(active ? 1 : 0, { damping: 14, stiffness: 180 });
  }, [active]);
  const pillStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(99,102,241,${interpolate(anim.value, [0, 1], [0.2, 0.7], Extrapolation.CLAMP)})`,
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(anim.value, [0, 1], [1, 1.02], Extrapolation.CLAMP) }],
  }));
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[s.filterPill, pillStyle, scaleStyle]}>
        {active && (
          <LinearGradient colors={["#312E81", "#6366F1"]} style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />
        )}
        <Text style={[s.filterText, active && s.filterTextActive]}>{label}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={s.filterBadge}>
            <Text style={s.filterBadgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Era status bar (top of list) ─────────────────────────────────────────────
const EraStatusBar: React.FC = () => {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);
  const shimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.5, 1], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View style={[s.eraStatusBar, shimStyle]}>
      <LinearGradient
        colors={["rgba(49,46,129,0.6)", "rgba(67,56,202,0.4)", "rgba(49,46,129,0.6)"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.eraStatusGrad}
      >
        <Text style={s.eraStatusSymbol}>✦</Text>
        <Text style={s.eraStatusText}>Era summarised 6 conversations while you were away</Text>
        <TouchableOpacity style={s.eraStatusBtn}>
          <Text style={s.eraStatusBtnText}>View</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── Stories / active contacts row ───────────────────────────────────────────
const STORY_CONTACTS = [
  { name: "Alex", avatarColors: ["#6366F1", "#8B5CF6"] as [string, string], avatar: "A", hasStory: true },
  { name: "Maya",  avatarColors: ["#10B981", "#059669"] as [string, string], avatar: "M", hasStory: true },
  { name: "Jordan", avatarColors: ["#F59E0B", "#EF4444"] as [string, string], avatar: "J", hasStory: false },
  { name: "Sam",  avatarColors: ["#0EA5E9", "#6366F1"] as [string, string], avatar: "S", hasStory: true },
  { name: "Lee",  avatarColors: ["#EC4899", "#F43F5E"] as [string, string], avatar: "L", hasStory: false },
];

const StoryBubble: React.FC<{ contact: typeof STORY_CONTACTS[0]; index: number }> = ({ contact, index }) => {
  const mountO = useSharedValue(0);
  const mountY = useSharedValue(12);
  useEffect(() => {
    mountO.value = withDelay(index * 80, withTiming(1, { duration: 350 }));
    mountY.value = withDelay(index * 80, withSpring(0, { damping: 14 }));
  }, []);
  const mountStyle = useAnimatedStyle(() => ({
    opacity: mountO.value,
    transform: [{ translateY: mountY.value }],
  }));
  return (
    <Animated.View style={[s.storyBubble, mountStyle]}>
      {contact.hasStory ? (
        <LinearGradient colors={["#6366F1", "#EC4899"]} style={s.storyRing}>
          <LinearGradient colors={contact.avatarColors} style={s.storyAvatar}>
            <Text style={s.storyAvatarText}>{contact.avatar}</Text>
          </LinearGradient>
        </LinearGradient>
      ) : (
        <LinearGradient colors={contact.avatarColors} style={[s.storyAvatar, { width: 52, height: 52 }]}>
          <Text style={s.storyAvatarText}>{contact.avatar}</Text>
        </LinearGradient>
      )}
      <Text style={s.storyName}>{contact.name}</Text>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ChatsScreen() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const headerY = useSharedValue(-20);
  const headerO = useSharedValue(0);
  const router = useRouter();  
  const [CHATS, setChats] = useState<any[]>([]);
//checking authentication state
  const { isAuthenticated, isHydrated, user } = useAuthStore();

useEffect(() => {
  
}, [user, isHydrated, isAuthenticated]);
 const {
    data: conversations = [],
    isLoading,
    refetch,
  } = useConversations(); 

  //backend
   const handleGetConversations = async () => {
  try {
    const result = await refetch();

    if (!result.data) return;

    const currentUserId = useAuthStore.getState().user?.id;

    const mappedChats = result.data.map((conversation) => {
      const otherMember =
        conversation.type === "DIRECT"
          ? conversation.members.find(
              (member) => member.userId !== currentUserId
            )
          : null;

      return {
        id: conversation.id,

        name:
          conversation.type === "GROUP"
            ? conversation.name
            : otherMember?.fullName ?? "Unknown User",

        avatar:
          `${otherMember?.fullName?.charAt(0).toUpperCase()}${otherMember?.fullName?.charAt(1).toLowerCase()}` ?? "U",

        avatarUrl: otherMember?.avatarUrl,

        avatarColors: ["#6366F1", "#8B5CF6"] as [string, string],

        message:
          conversation.lastMessage?.text ??
          "Start your conversation",

        time: conversation.lastMessage
          ? new Date(
              conversation.lastMessage.timestamp
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",

        unread: 0,

        online: false,

        typing: false,

        pinned: false,

        muted: false,

        verified: false,

        eraSummary: null,

        isGroup: conversation.type === "GROUP",

        memberCount: conversation.members.length,

        conversation,
      };
    });

    setChats(mappedChats);

    
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to fetch conversations");
  }
};

  // ============================
  // HANDLE GET BY ID
  // ============================




useEffect(() => {
  if (!isAuthenticated && isHydrated) {
    router.replace("/(auth)/login");
  }
handleGetConversations();
}, [user,isAuthenticated, isHydrated, router]);



 


//backend end

  useEffect(() => {
    headerY.value = withSpring(0, { damping: 16, stiffness: 120 });
    headerO.value = withTiming(1, { duration: 500 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerO.value,
    transform: [{ translateY: headerY.value }],
  }));

  const filtered = CHATS.filter((c) => {
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ? true :
      filter === "Unread" ? c.unread > 0 :
      filter === "Groups" ? !!c.isGroup :
      filter === "Era AI" ? !!c.isEra :
      filter === "Pinned" ? c.pinned :
      true;
    return matchSearch && matchFilter;
  });

  const totalUnread = CHATS.reduce((a, c) => a + c.unread, 0);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      {/* Ambient background glow */}
      <View style={s.ambientGlow} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* ── Header ── */}
        <Animated.View style={[s.header, headerStyle]}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.headerEyebrow}>ERA</Text>
              <Text style={s.headerTitle}>Messages</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              {/* Notification bell */}
              <TouchableOpacity style={s.headerIconBtn}>
                <Text style={s.headerIcon}>
                  <Bell color={"white"}/>
                </Text>
                <View style={s.headerIconBadge} />
              </TouchableOpacity>
              {/* Profile */}
              <TouchableOpacity>
                <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={s.profileAvatar}>
                  <Text style={s.profileAvatarText}>A</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <SearchBar value={search} onChange={setSearch} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          scrollEventThrottle={16}
        >
          {/* ── Filter pills ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
          >
            {FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={filter === f}
                onPress={() => setFilter(f)}
                badge={f === "Unread" ? totalUnread : undefined}
              />
            ))}
          </ScrollView>

          {/* ── Active contacts / stories ── */}
          {/* {search === "" && filter === "All" && (
            <View style={s.storiesSection}>
              <Text style={s.sectionLabel}>Active now</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesRow}>
                {STORY_CONTACTS.map((c, i) => (
                  <StoryBubble key={c.name} contact={c} index={i} />
                ))}
              </ScrollView>
            </View>
          )} */}

          {/* ── Era status ── */}
          {search === "" && filter === "All" && <EraStatusBar />}

          {/* ── Section header ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>
              {filter === "All" ? "All conversations" : filter}
              <Text style={s.sectionCount}> · {filtered.length}</Text>
            </Text>
            <TouchableOpacity>
              <Text style={s.sectionAction}>Mark all read</Text>
            </TouchableOpacity>
          </View>

          {/* ── Chat list ── */}
          {filtered.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>✦</Text>
              <Text style={s.emptyTitle}>Nothing here yet</Text>
              <Text style={s.emptyBody}>Start a conversation or ask Era to find someone.</Text>
            </View>
          ) : (
            filtered.map((chat, i) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                index={i}
                onPress={() => router.push(`/(tabs)/chats/${chat.id}`)} 
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ── Era FAB ── */}
      <EraFAB />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg0,
  },
  ambientGlow: {
    position: "absolute",
    top: -120,
    left: W / 2 - 180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(99,102,241,0.07)",
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    color: T.indigoLt,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -0.8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: { fontSize: 16 },
  headerIconBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.indigo,
    borderWidth: 1.5,
    borderColor: T.bg0,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(99,102,241,0.5)",
  },
  profileAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchIcon: { fontSize: 18, color: T.dimmed },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: T.text,
    padding: 0,
  },
  searchClear: {
    fontSize: 13,
    color: T.dimmed,
    paddingHorizontal: 4,
  },

  // Filters
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: T.bg2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: T.muted,
  },
  filterTextActive: {
    color: "#fff",
  },
  filterBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Stories
  storiesSection: {
    marginTop: 16,
    paddingLeft: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: T.dimmed,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionCount: {
    color: T.indigo,
    fontWeight: "600",
  },
  storiesRow: {
    gap: 16,
    paddingRight: 20,
  },
  storyBubble: {
    alignItems: "center",
    gap: 6,
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: T.bg0,
  },
  storyAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  storyName: {
    fontSize: 11,
    color: T.muted,
    fontWeight: "500",
  },

  // Era status
  eraStatusBar: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  eraStatusGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  eraStatusSymbol: {
    fontSize: 14,
    color: T.indigoXl,
  },
  eraStatusText: {
    flex: 1,
    fontSize: 12,
    color: T.indigoXl,
    fontWeight: "500",
    lineHeight: 17,
  },
  eraStatusBtn: {
    backgroundColor: "rgba(99,102,241,0.3)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eraStatusBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: T.indigoXl,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 6,
  },
  sectionAction: {
    fontSize: 12,
    color: T.indigoLt,
    fontWeight: "600",
  },

  // Chat row
  chatRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  chatRowInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(99,102,241,0.06)",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    fontSize: 15,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  chatTime: {
    fontSize: 11,
    color: T.dimmed,
    fontWeight: "500",
  },
  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatMessage: {
    fontSize: 13,
    color: T.muted,
    lineHeight: 18,
  },
  chatMessageUnread: {
    color: T.text,
    fontWeight: "600",
  },
  eraSummaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  eraSummaryIcon: {
    fontSize: 9,
    color: T.indigoXl,
  },
  eraSummaryText: {
    fontSize: 11,
    color: T.indigoXl,
    fontWeight: "500",
    flexShrink: 1,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: T.indigo,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeMuted: {
    backgroundColor: T.bg3,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },

  // Presence
  onlineDotWrap: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDotRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.green,
  },
  onlineDotCore: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: T.green,
    borderWidth: 1.5,
    borderColor: T.bg0,
  },

  // Typing
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.indigo,
  },
  typingText: {
    fontSize: 12,
    color: T.indigoLt,
    fontWeight: "500",
  },

  // Badges
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(99,102,241,0.25)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  groupChip: {
    backgroundColor: T.bg3,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  groupChipText: {
    fontSize: 10,
    color: T.dimmed,
    fontWeight: "600",
  },
  pinIcon: {
    fontSize: 10,
    opacity: 0.6,
  },

  // FAB
  fabWrap: {
    position: "absolute",
    bottom: 28,
    right: 24,
    alignItems: "flex-end",
  },
  fabMain: {
    shadowColor: T.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  fabGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  fabOption: {
    position: "absolute",
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fabOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fabOptionGrad: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  fabOptionIcon: {
    fontSize: 18,
  },
  fabOptionLabel: {
    backgroundColor: T.bg3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: T.border,
  },
  fabOptionLabelText: {
    fontSize: 13,
    color: T.text,
    fontWeight: "600",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
    color: T.indigoLt,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.text,
  },
  emptyBody: {
    fontSize: 14,
    color: T.muted,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});