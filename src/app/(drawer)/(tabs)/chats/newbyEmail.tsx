// app/(drawer)/(tabs)/chats/new.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Mail,
  MessageSquare,
  Search,
  UserPlus,
  X,
} from "lucide-react-native";
import { useCreateDirectConversation } from "../../../../backend/conversation/useConversations";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Color tokens ─────────────────────────────────────────────────────────────
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
  red:     "#EF4444",
  green:   "#22C55E",
};



// ─── Animated input field ─────────────────────────────────────────────────────
const EmailInput: React.FC<{
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
  hasError: boolean;
}> = ({ value, onChange, onClear, hasError }) => {
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: hasError
      ? C.red
      : `rgba(99,102,241,${interpolate(focus.value, [0, 1], [0.1, 0.55], Extrapolation.CLAMP)})`,
    backgroundColor: `rgba(26,34,53,${interpolate(focus.value, [0, 1], [1, 1], Extrapolation.CLAMP)})`,
  }));

  return (
    <Animated.View style={[s.inputWrap, borderStyle]}>
      <Mail size={18} color={hasError ? C.red : C.indigoL} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="someone@example.com"
        placeholderTextColor={C.dim}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="done"
        style={s.input}
        selectionColor={C.indigo}
        onFocus={() => { focus.value = withTiming(1, { duration: 200 }); }}
        onBlur={() => { focus.value = withTiming(0, { duration: 200 }); }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={s.clearBtn}>
            <X size={12} color={C.dim} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ─── Suggestion chip ──────────────────────────────────────────────────────────


// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NewDirectConversationScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateDirectConversation();

  const btnScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 55 }),
      withTiming(8,  { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming(6,  { duration: 55 }),
      withTiming(0,  { duration: 55 })
    );
  };

  const handleCreate = (emailOverride?: string) => {
    const trimmed = (emailOverride ?? email).trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Enter a valid email address");
      triggerShake();
      return;
    }
    setError(null);
    mutate(trimmed, {
      onSuccess: (conversation) => {
        router.replace(`/(drawer)/(tabs)/chats/${conversation.id}`);
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message ?? "Could not start conversation";
        setError(message);
        triggerShake();
      },
    });
  };

  const isValid = EMAIL_REGEX.test(email.trim());
  

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      {/* Ambient glow */}
      <View style={s.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={s.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>New Chat</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero area ── */}
          <View style={s.hero}>
            <LinearGradient colors={[C.indigoD, C.indigo]} style={s.heroIcon}>
              <UserPlus size={28} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <Text style={s.heroTitle}>Start a conversation</Text>
            <Text style={s.heroSub}>
              Enter an email address to start chatting, or pick someone from your contacts below.
            </Text>
          </View>

          {/* ── Email input ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Email address</Text>
            <Animated.View style={shakeStyle}>
              <EmailInput
                value={email}
                onChange={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                onClear={() => { setEmail(""); setError(null); }}
                hasError={!!error}
              />
              {error && (
                <Animated.View entering={undefined} style={s.errorRow}>
                  <View style={s.errorDot} />
                  <Text style={s.errorText}>{error}</Text>
                </Animated.View>
              )}
              {isValid && !error && (
                <View style={s.validRow}>
                  <View style={s.validDot} />
                  <Text style={s.validText}>Looks good!</Text>
                </View>
              )}
            </Animated.View>
          </View>

          {/* ── CTA button ── */}
          <View style={s.btnWrap}>
            <Animated.View style={[{ width: "100%" }, btnStyle]}>
              <TouchableOpacity
                onPress={() => handleCreate()}
                onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 15 }); }}
                onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
                disabled={isPending}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={isPending || !isValid ? [C.bg3, C.bg2] : [C.indigoD, C.indigo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.btn}
                >
                  {isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MessageSquare
                        size={18}
                        color={isValid ? "#fff" : C.dim}
                        strokeWidth={2}
                      />
                      <Text style={[s.btnText, !isValid && { color: C.dim }]}>
                        Start Chat
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },
  glow: {
    position: "absolute",
    top: -80,
    left: "20%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(99,102,241,0.08)",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.text, letterSpacing: -0.3 },

  // Hero
  hero: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 32, gap: 10 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.4 },
  heroSub: {
    fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 21,
  },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: C.dim,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
  },

  // Input
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  input: { flex: 1, fontSize: 15, color: C.text },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.bg3, alignItems: "center", justifyContent: "center",
  },

  // Feedback
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 2 },
  errorDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.red },
  errorText: { fontSize: 12, color: C.red, fontWeight: "500" },
  validRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginLeft: 2 },
  validDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green },
  validText: { fontSize: 12, color: C.green, fontWeight: "500" },

  // Button
  btnWrap: { paddingHorizontal: 20, marginTop: 4, marginBottom: 28 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: -0.2 },

 
  
  divider: { height: 1, backgroundColor: C.border, marginLeft: 72 },
});