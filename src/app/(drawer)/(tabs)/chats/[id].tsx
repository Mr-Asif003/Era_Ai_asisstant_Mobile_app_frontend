import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/lib/constants";
import { MessageService } from "@/backend/message/message.service";
import { connectSocket, subscribeToMessages, subscribeToDelivery } from "@/backend/message/socket";
import { conversationService } from "@/backend/conversation/conversation.service";
// ASSUMPTION: adjust this import to wherever your auth/user store actually lives.
// It just needs to expose the logged-in user's id so we know which messages are "mine".
import { useAuthStore } from "@/stores/auth.store";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Types ──────────────────────────────────────────────────────────────────

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  status: MessageStatus;
}

interface ChatUser {
  id: string;
  name: string;
  avatarColor: [string, string];
  initial: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Confirmed shape: conversationService.getById(id) resolves to an ARRAY
// (length 1 for a direct chat) of conversation-summary objects like this:
// [{
//   avatar: "As", avatarColors: ["#6366F1","#8B5CF6"], avatarUrl: null,
//   conversation: { id, type: "DIRECT", name: null, avatarUrl: null,
//                    members: [...], lastMessage: null, createdAt, updatedAt },
//   eraSummary: null, id, isGroup: false, memberCount: 2,
//   message: "Start your conversation", muted: false, name: "ashab",
//   online: false, pinned: false, time: "", typing: false, unread: 0, verified: false
// }]
// The `members` array's per-item shape wasn't visible in the console dump
// (it printed collapsed as "Array(2)") — left loosely typed below, tighten
// once you can see an expanded member object.
interface ConversationMember {
  id?: string;
  name?: string;
  avatarUrl?: string | null;
  online?: boolean;
  [key: string]: unknown;
}

interface ConversationInfo {
  id: string;
  type: string; // "DIRECT" | "GROUP" | ...
  name: string | null;
  avatarUrl: string | null;
  members: ConversationMember[];
  lastMessage: unknown | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationSummary {
  avatar: string; // initials, e.g. "As"
  avatarColors: [string, string];
  avatarUrl: string | null;
  conversation: ConversationInfo;
  eraSummary: string | null;
  id: string;
  isGroup: boolean;
  memberCount: number;
  message: string; // last-message preview, or "Start your conversation" placeholder
  muted: boolean;
  name: string; // other participant's display name, already resolved server-side
  online: boolean;
  pinned: boolean;
  time: string;
  typing: boolean;
  unread: number;
  verified: boolean;
}

interface BackendMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  status?: MessageStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// The backend already resolves the other participant's name/avatar/online
// status onto the top-level summary object, so we just map it straight
// across — no palette hashing or participant-list searching needed for the
// header. We still try to pull the other member's real id out of
// `conversation.members` (needed so we can tag incoming messages as "me" vs
// "them"), falling back to the conversation id if that shape doesn't hold.
function otherUserIdFromSummary(summary: ConversationSummary, currentUserId: string): string {
  const other = summary.conversation?.members?.find((m) => m.id && m.id !== currentUserId);
  return other?.id ?? `${summary.id}-other`;
}

function toChatUserFromSummary(summary: ConversationSummary, currentUserId: string): ChatUser {
  return {
    id: otherUserIdFromSummary(summary, currentUserId),
    name: summary.name,
    initial: summary.avatar || summary.name?.[0]?.toUpperCase() || "?",
    avatarColor: summary.avatarColors,
    isOnline: summary.online,
  };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function isNewDay(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].timestamp).toDateString();
  const curr = new Date(messages[index].timestamp).toDateString();
  return prev !== curr;
}

// ─── Status icon ──────────────────────────────────────────────────────────────

const StatusIcon: React.FC<{ status: MessageStatus }> = ({ status }) => {
  switch (status) {
    case "sending":
      return <Clock size={12} color={COLORS.text.disabled} />;
    case "failed":
      return <AlertCircle size={12} color="#EF4444" />;
    case "sent":
      return <Check size={13} color={COLORS.text.disabled} />;
    case "delivered":
      return <CheckCheck size={13} color={COLORS.text.disabled} />;
    case "read":
      return <CheckCheck size={13} color={COLORS.indigo.light} />;
    default:
      return null;
  }
};

// ─── Date separator ────────────────────────────────────────────────────────────

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
  <View style={styles.dateRow}>
    <View style={styles.dateLine} />
    <View style={styles.datePill}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
    <View style={styles.dateLine} />
  </View>
);

// ─── Message bubble ────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  chatUser: ChatUser;
  onLongPress: (message: Message) => void;
}> = ({ message, isMe, showAvatar, chatUser, onLongPress }) => {
  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      {!isMe && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <LinearGradient colors={chatUser.avatarColor} style={styles.avatar}>
              <Text style={styles.avatarText}>{chatUser.initial}</Text>
            </LinearGradient>
          ) : (
            <View style={{ width: 28 }} />
          )}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => isMe && onLongPress(message)}
        style={styles.bubbleWrap}
      >
        {isMe ? (
          <LinearGradient
            colors={[COLORS.indigo.dark, COLORS.indigo.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            <Text style={styles.textMe}>{message.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleThem]}>
            <Text style={styles.textThem}>{message.text}</Text>
          </View>
        )}

        <View style={[styles.meta, isMe && styles.metaMe]}>
          <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
          {isMe && <StatusIcon status={message.status} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

// ─── Typing indicator ──────────────────────────────────────────────────────────

const TypingIndicator: React.FC<{ user: ChatUser }> = ({ user }) => (
  <View style={styles.typingRow}>
    <LinearGradient colors={user.avatarColor} style={styles.typingAvatar}>
      <Text style={styles.typingAvatarText}>{user.initial}</Text>
    </LinearGradient>
    <View style={styles.typingBubble}>
      <View style={styles.typingDot} />
      <View style={[styles.typingDot, { opacity: 0.6 }]} />
      <View style={[styles.typingDot, { opacity: 0.3 }]} />
    </View>
  </View>
);

// ─── Input bar ─────────────────────────────────────────────────────────────────

const InputBar: React.FC<{ onSend: (text: string) => void; disabled?: boolean }> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");
  const hasText = text.trim().length > 0;

  const handleSend = () => {
    if (!hasText || disabled) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={styles.inputBar}>
      <TouchableOpacity style={styles.iconBtn}>
        <Paperclip size={20} color={COLORS.text.muted} />
      </TouchableOpacity>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={COLORS.text.disabled}
          multiline
          maxLength={2000}
          selectionColor={COLORS.indigo.primary}
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!hasText || disabled}
        style={[styles.sendBtn, (!hasText || disabled) && styles.sendBtnDisabled]}
      >
        <LinearGradient
          colors={hasText && !disabled ? [COLORS.indigo.dark, COLORS.indigo.primary] : [COLORS.bg.tertiary, COLORS.bg.tertiary]}
          style={styles.sendGrad}
        >
          <Send size={18} color={hasText && !disabled ? "#fff" : COLORS.text.disabled} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────

const ChatHeader: React.FC<{
  user: ChatUser;
  isTyping: boolean;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onInfo: () => void;
}> = ({ user, isTyping, onBack, onVoiceCall, onVideoCall, onInfo }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <ArrowLeft size={22} color={COLORS.text.primary} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.headerCenter} onPress={onInfo} activeOpacity={0.8}>
      <View style={styles.avatarWrap}>
        <LinearGradient colors={user.avatarColor} style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{user.initial}</Text>
        </LinearGradient>
        {user.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View>
        <Text style={styles.headerName}>{user.name}</Text>
        <Text style={styles.headerStatus}>
          {isTyping ? "typing…" : user.isOnline ? "Online" : `Last seen ${user.lastSeen ?? "recently"}`}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.headerActions}>
      <TouchableOpacity style={styles.actionBtn} onPress={onVoiceCall}>
        <Phone size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onVideoCall}>
        <Video size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onInfo}>
        <MoreVertical size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main screen ────────────────────────────────────────────────────────────────

const FALLBACK_USER: ChatUser = {
  id: "unknown",
  name: "Unknown",
  avatarColor: ["#6366F1", "#8B5CF6"],
  initial: "?",
  isOnline: false,
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
 console.log("ChatScreen id:", id);
  // ASSUMPTION: your auth store exposes the current user's id like this.
  // Swap for whatever your real hook returns.
  const currentUserId = useAuthStore((s) => s.user?.id) ?? "me";
  console.log("[chat] RENDER at", Date.now());

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  // ─── Load the conversation from the backend ────────────────────────────────
 const loadConversation = useCallback(
  async (conversationId: string) => {
    if (!conversationId) {
      setLoadError("Missing conversation id");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const conversation = await conversationService.getById(conversationId);

      if (!conversation) {
        setLoadError("Conversation not found");
        return;
      }

      // Find the other participant (for direct chat)
      const otherMember = conversation.members.find(
        (member) => member.userId !== currentUserId
      );

      if (otherMember) {
       setOtherUser({
  id: otherMember.userId,
  name: otherMember.fullName,
  initial: otherMember.fullName.charAt(0).toUpperCase(),
  avatarColor: ["#6366F1", "#8B5CF6"], // REQUIRED
  isOnline: false,
});
      }

      // -------------------------------------------------------
      const backendMessages = await MessageService.getMessages(conversationId);
      const mapped: Message[] = backendMessages.map((m) => ({
        id: m.id,
        text: m.content,
        senderId: m.senderId === currentUserId ? "me" : m.senderId,
        timestamp: m.createdAt,
        status: (m.status?.toLowerCase() as MessageStatus) ?? "delivered",
      }));
      setMessages(mapped);
      // -------------------------------------------------------
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setLoadError("Couldn't load this conversation");
      Alert.alert("Error", "Conversation not found");
    } finally {
      setIsLoading(false);
    }
  },
  [currentUserId]
);

useEffect(() => {
  if (id) {
    loadConversation(id as string);
  }
}, [id, loadConversation]);

  // TODO: subscribe to the STOMP topic for this conversation here and merge
  // incoming messages into `messages` (dedupe by id, update status on receipts).
  useEffect(() => {
    let unsubMessages: (() => void) | undefined;
    let unsubDelivery: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        console.log("[chat] attempting connectSocket()");
        await connectSocket();
        console.log("[chat] connectSocket() resolved, subscribing...");
        if (cancelled) return;

        unsubMessages = subscribeToMessages((incoming) => {
  console.log("[chat] RAW message from socket:", incoming, "| expecting conversationId:", id);
  if (incoming.conversationId !== id) {
    console.log("[chat] ⚠️ filtered out — conversationId mismatch");
    return;
  }
  console.log("[chat] ✅ matched, adding to messages");

  setMessages((prev) => {
    if (prev.some((m) => m.id === incoming.id)) return prev;
    return [
      ...prev,
      {
        id: incoming.id,
        text: incoming.content,
        senderId: incoming.senderId === currentUserId ? "me" : incoming.senderId,
        timestamp: incoming.createdAt,
        status: (incoming.status?.toLowerCase() as MessageStatus) ?? "delivered",
      },
    ];
  });
});

        unsubDelivery = subscribeToDelivery((receipt) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === receipt.messageId
                ? { ...m, status: receipt.status.toLowerCase() as MessageStatus }
                : m
            )
          );
        });
      } catch (err) {
        console.log("Socket connect failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      unsubMessages?.();
      unsubDelivery?.();
    };
  }, [id]);





  const handleSend = useCallback(
    (text: string) => {
      if (!id) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        text,
        senderId: "me",
        timestamp: new Date().toISOString(),
        status: "sending",
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      (async () => {
        try {
          const saved = await MessageService.sendMessage({
            conversationId: id as string,
            text,
          });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    id: saved.id,
                    text: saved.content,
                    senderId: "me",
                    timestamp: saved.createdAt,
                    status: "sent",
                  }
                : m
            )
          );
        } catch (error) {
          console.log("Failed to send message:", error);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)));
        }
      })();
    },
    [id]
  );

  const handleLongPressMessage = useCallback((message: Message) => {
    Alert.alert("Delete message?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setMessages((prev) => prev.filter((m) => m.id !== message.id)),
      },
    ]);
  }, []);

  const chatUser = otherUser ?? FALLBACK_USER;

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMe = item.senderId === "me";
      const next = messages[index + 1];
      const showAvatar = !isMe && (!next || next.senderId !== item.senderId);

      return (
        <View>
          {isNewDay(messages, index) && <DateSeparator date={formatDate(item.timestamp)} />}
          <MessageBubble
            message={item}
            isMe={isMe}
            showAvatar={showAvatar}
            chatUser={chatUser}
            onLongPress={handleLongPressMessage}
          />
        </View>
      );
    },
    [messages, chatUser, handleLongPressMessage]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.root, styles.centered]} edges={["top"]}>
        <ActivityIndicator color={COLORS.indigo.primary} />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={[styles.root, styles.centered]} edges={["top"]}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBackBtn}>
          <Text style={styles.errorBackText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ChatHeader
        user={chatUser}
        isTyping={isTyping}
        onBack={() => router.back()}
        onVoiceCall={() => Alert.alert("Voice call", "Coming soon")}
        onVideoCall={() => Alert.alert("Video call", "Coming soon")}
        onInfo={() => Alert.alert("Chat info", "Coming soon")}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={isTyping ? <TypingIndicator user={chatUser} /> : null}
        />

        <InputBar onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg.primary },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14, color: COLORS.text.muted },
  errorBackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.bg.tertiary,
  },
  errorBackText: { fontSize: 14, fontWeight: "600", color: COLORS.text.primary },
  list: { paddingVertical: 12, paddingBottom: 8 },

  // date separator
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 16, paddingHorizontal: 20 },
  dateLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  datePill: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dateText: { fontSize: 11, color: COLORS.text.disabled, fontWeight: "500" },

  // message bubble
  msgRow: {
    flexDirection: "row",
    marginVertical: 2,
    paddingHorizontal: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  msgRowMe: { flexDirection: "row-reverse" },
  avatarSlot: { width: 28, flexShrink: 0 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  bubbleWrap: { maxWidth: SCREEN_W * 0.75 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: COLORS.bg.tertiary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  textMe: { fontSize: 15, color: "#fff", lineHeight: 21 },
  textThem: { fontSize: 15, color: COLORS.text.primary, lineHeight: 21 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3, marginLeft: 4 },
  metaMe: { justifyContent: "flex-end", marginRight: 4, marginLeft: 0 },
  time: { fontSize: 10, color: COLORS.text.disabled },

  // typing indicator
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, marginVertical: 6 },
  typingAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  typingAvatarText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.indigo.light },

  // input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    marginBottom: Platform.OS === "ios" ? 0 : 4,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
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
  input: { fontSize: 15, color: COLORS.text.primary, maxHeight: 100, lineHeight: 21 },
  sendBtn: {},
  sendBtnDisabled: { opacity: 0.6 },
  sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  // header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: { position: "relative" },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerAvatarText: { fontSize: 16, fontWeight: "700", color: "#fff" },
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
  headerName: { fontSize: 16, fontWeight: "700", color: COLORS.text.primary, letterSpacing: -0.2 },
  headerStatus: { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 2 },
  actionBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});