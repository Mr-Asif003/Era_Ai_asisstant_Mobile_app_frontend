import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  User,
  Bell,
  Lock,
  Palette,
  MessageSquare,
  Mic,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Volume2,
  Smartphone,
  Globe,
  Trash2,
  Camera,
  Edit3,
  Check,
  X,
  Star,
  Zap,
  Eye,
  EyeOff,
  Download,
  Link,
  Info,
  AlertTriangle,
  Sparkles,
  Radio,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { COLORS } from "@/lib/constants";

const { width: W } = Dimensions.get("window");

// ─── Color palette ────────────────────────────────────────────────────────────

const C = {
  bg0:      "#0B0E1A",
  bg1:      "#111827",
  bg2:      "#1a2235",
  bg3:      "#252D3D",
  indigo:   "#6366F1",
  indigoD:  "#4F46E5",
  indigoL:  "#818CF8",
  text:     "#F1F5F9",
  muted:    "#94A3B8",
  dim:      "#64748B",
  border:   "rgba(255,255,255,0.06)",
  borderHi: "rgba(99,102,241,0.3)",
  green:    "#22C55E",
  red:      "#EF4444",
  amber:    "#F59E0B",
  pink:     "#F472B6",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingSection =
  | "main"
  | "edit_profile"
  | "notifications"
  | "privacy"
  | "appearance"
  | "chat_settings"
  | "era_settings"
  | "storage"
  | "about";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS: [string, string][] = [
  ["#6366F1", "#8B5CF6"],
  ["#EC4899", "#F43F5E"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
  ["#DB2777", "#7C3AED"],
  ["#0EA5E9", "#6366F1"],
];

// ─── Shared components ────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({
  title,
  icon,
}) => (
  <View style={sh.wrap}>
    {icon}
    <Text style={sh.title}>{title}</Text>
  </View>
);

const sh = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: C.dim,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

// ─── Setting Row ──────────────────────────────────────────────────────────────

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  badge?: string;
  last?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconBg,
  label,
  value,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  danger,
  badge,
  last,
}) => {
  const scale = useSharedValue(1);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withTiming(0.985, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View style={rowStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={toggle ? 1 : 0.85}
        disabled={toggle}
      >
        <View style={[sr.wrap, !last && sr.border]}>
          <View style={[sr.iconWrap, { backgroundColor: iconBg }]}>
            {icon}
          </View>
          <Text style={[sr.label, danger && sr.dangerLabel]}>{label}</Text>
          <View style={sr.right}>
            {badge && (
              <View style={sr.badge}>
                <Text style={sr.badgeText}>{badge}</Text>
              </View>
            )}
            {value && <Text style={sr.value}>{value}</Text>}
            {toggle && (
              <Switch
                value={toggleValue}
                onValueChange={onToggle}
                trackColor={{ false: C.bg3, true: C.indigo }}
                thumbColor="#fff"
                ios_backgroundColor={C.bg3}
              />
            )}
            {!toggle && onPress && (
              <ChevronRight size={16} color={C.dim} strokeWidth={2} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const sr = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontWeight: "500",
  },
  dangerLabel: { color: C.red },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: 13,
    color: C.muted,
  },
  badge: {
    backgroundColor: C.indigo,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
});

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({
  children,
  style,
}) => (
  <View style={[cd.wrap, style]}>
    {children}
  </View>
);

const cd = StyleSheet.create({
  wrap: {
    backgroundColor: C.bg1,
    borderRadius: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
});

// ─── Sub-screen header ────────────────────────────────────────────────────────

const SubHeader: React.FC<{
  title: string;
  onBack: () => void;
}> = ({ title, onBack }) => (
  <View style={sub.wrap}>
    <TouchableOpacity onPress={onBack} style={sub.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={sub.backText}>‹</Text>
    </TouchableOpacity>
    <Text style={sub.title}>{title}</Text>
    <View style={{ width: 36 }} />
  </View>
);

const sub = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 32,
    color: C.indigoL,
    lineHeight: 36,
    fontWeight: "300",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },
});

// ─── Edit Profile Screen ──────────────────────────────────────────────────────

const EditProfileScreen: React.FC<{
  user: any;
  onBack: () => void;
  onSave: (data: any) => void;
}> = ({ user, onBack, onSave }) => {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave({ displayName, username, bio });
    setIsSaving(false);
    onBack();
  };

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Edit Profile" onBack={onBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar selector */}
        <View style={ep.avatarSection}>
          <View style={ep.avatarWrap}>
            <LinearGradient
              colors={AVATAR_GRADIENTS[selectedGradient]}
              style={ep.avatar}
            >
              <Text style={ep.avatarInitial}>
                {displayName?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={ep.cameraBtn}>
              <Camera size={16} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={ep.avatarHint}>Tap to change photo</Text>

          {/* Gradient picker */}
          <View style={ep.gradientRow}>
            {AVATAR_GRADIENTS.map((g, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedGradient(i)}
                style={[ep.gradientSwatch, selectedGradient === i && ep.swatchActive]}
              >
                <LinearGradient colors={g} style={ep.swatchGrad} />
                {selectedGradient === i && (
                  <View style={ep.swatchCheck}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 8 }}>
          <EditField
            label="Display Name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Your full name"
            maxLength={40}
          />
          <EditField
            label="Username"
            value={username}
            onChange={(t) => setUsername(t.replace(/\s/g, "").toLowerCase())}
            placeholder="your_username"
            prefix="@"
            maxLength={20}
          />
          <EditField
            label="Bio"
            value={bio}
            onChange={setBio}
            placeholder="Tell the world about yourself…"
            multiline
            maxLength={120}
          />

          {/* Character count */}
          <Text style={{ fontSize: 11, color: C.dim, textAlign: "right", marginTop: -8 }}>
            {bio.length}/120
          </Text>

          {/* Save button */}
          <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
            <LinearGradient
              colors={[C.indigoD, C.indigo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={ep.saveBtn}
            >
              {isSaving ? (
                <Text style={ep.saveBtnText}>Saving…</Text>
              ) : (
                <>
                  <Check size={18} color="#fff" strokeWidth={2.5} />
                  <Text style={ep.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const EditField: React.FC<{
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  prefix?: string;
  multiline?: boolean;
  maxLength?: number;
}> = ({ label, value, onChange, placeholder, prefix, multiline, maxLength }) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(99,102,241,${interpolate(
      borderAnim.value, [0, 1], [0.08, 0.5], Extrapolation.CLAMP
    )})`,
  }));

  return (
    <View style={ef.wrap}>
      <Text style={ef.label}>{label}</Text>
      <Animated.View style={[ef.inputWrap, borderStyle]}>
        {prefix && <Text style={ef.prefix}>{prefix}</Text>}
        <TextInput
          style={[ef.input, multiline && ef.multiline]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.dim}
          multiline={multiline}
          maxLength={maxLength}
          selectionColor={C.indigo}
          onFocus={() => { borderAnim.value = withTiming(1, { duration: 200 }); }}
          onBlur={() => { borderAnim.value = withTiming(0, { duration: 200 }); }}
        />
      </Animated.View>
    </View>
  );
};

const ef = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: C.muted, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 9,
    gap: 6,
  },
  prefix: { fontSize: 15, color: C.indigoL, fontWeight: "600" },
  input: { flex: 1, fontSize: 15, color: C.text },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});

const ep = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 38, fontWeight: "700", color: "#fff" },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.indigo,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: C.bg0,
  },
  avatarHint: { fontSize: 13, color: C.muted },
  gradientRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  gradientSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  swatchActive: {
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  swatchGrad: { flex: 1 },
  swatchCheck: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

// ─── Notifications Screen ─────────────────────────────────────────────────────

const NotificationsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    messages: true,
    mentions: true,
    reactions: false,
    voiceNotes: true,
    groupMessages: true,
    eraDigest: true,
    sound: true,
    vibration: true,
    preview: true,
    doNotDisturb: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Notifications" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Messages" icon={<Bell size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="New Messages" toggle toggleValue={settings.messages} onToggle={() => toggle("messages")} />
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Mentions" toggle toggleValue={settings.mentions} onToggle={() => toggle("mentions")} />
          <SettingRow icon={<Star size={18} color="#fff" strokeWidth={2} />} iconBg="#EC4899"
            label="Reactions" toggle toggleValue={settings.reactions} onToggle={() => toggle("reactions")} />
          <SettingRow icon={<Mic size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Voice Notes" toggle toggleValue={settings.voiceNotes} onToggle={() => toggle("voiceNotes")} />
          <SettingRow icon={<Globe size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Group Messages" toggle toggleValue={settings.groupMessages} onToggle={() => toggle("groupMessages")} last />
        </Card>

        <SectionHeader title="Era AI" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Daily Digest" toggle toggleValue={settings.eraDigest} onToggle={() => toggle("eraDigest")} last />
        </Card>

        <SectionHeader title="Sound & Vibration" icon={<Volume2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#F472B6"
            label="Notification Sound" toggle toggleValue={settings.sound} onToggle={() => toggle("sound")} />
          <SettingRow icon={<Smartphone size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Vibration" toggle toggleValue={settings.vibration} onToggle={() => toggle("vibration")} last />
        </Card>

        <SectionHeader title="Display" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Eye size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Show Preview" toggle toggleValue={settings.preview} onToggle={() => toggle("preview")} />
          <SettingRow icon={<Moon size={18} color="#fff" strokeWidth={2} />} iconBg="#4C1D95"
            label="Do Not Disturb" toggle toggleValue={settings.doNotDisturb} onToggle={() => toggle("doNotDisturb")} last />
        </Card>

      </ScrollView>
    </Animated.View>
  );
};

// ─── Privacy Screen ───────────────────────────────────────────────────────────

const PrivacyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    lastSeen: true,
    readReceipts: true,
    onlineStatus: true,
    typingIndicator: true,
    twoFactor: false,
  });
  const [showPhone, setShowPhone] = useState(false);

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Privacy & Security" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Visibility" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Eye size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Last Seen" toggle toggleValue={settings.lastSeen} onToggle={() => toggle("lastSeen")} />
          <SettingRow icon={<Check size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Read Receipts" toggle toggleValue={settings.readReceipts} onToggle={() => toggle("readReceipts")} />
          <SettingRow icon={<Globe size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Online Status" toggle toggleValue={settings.onlineStatus} onToggle={() => toggle("onlineStatus")} />
          <SettingRow icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Typing Indicator" toggle toggleValue={settings.typingIndicator} onToggle={() => toggle("typingIndicator")} last />
        </Card>

        <SectionHeader title="Account Security" icon={<Shield size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Shield size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Two-Factor Auth" toggle toggleValue={settings.twoFactor} onToggle={() => toggle("twoFactor")}
            badge={!settings.twoFactor ? "Off" : undefined} />
          <SettingRow icon={<Lock size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label="Change Password" onPress={() => Alert.alert("Change Password", "Coming soon")} />
          <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Active Sessions" value="2 devices" onPress={() => Alert.alert("Sessions", "Manage active sessions")} last />
        </Card>

        <SectionHeader title="Data" icon={<Download size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Download size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Export My Data" onPress={() => Alert.alert("Export Data", "We'll email you a copy of your data within 24 hours.")} />
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Delete Account" danger onPress={() =>
              Alert.alert("Delete Account", "This will permanently delete your account and all data. This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => {} },
              ])
            } last />
        </Card>

      </ScrollView>
    </Animated.View>
  );
};

// ─── Appearance Screen ────────────────────────────────────────────────────────

const AppearanceScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [bubbleStyle, setBubbleStyle] = useState<"rounded" | "sharp">("rounded");
  const [accentColor, setAccentColor] = useState(0);

  const ACCENTS = [
    { color: "#6366F1", name: "Indigo" },
    { color: "#EC4899", name: "Pink" },
    { color: "#10B981", name: "Emerald" },
    { color: "#F59E0B", name: "Amber" },
    { color: "#0EA5E9", name: "Sky" },
    { color: "#8B5CF6", name: "Violet" },
  ];

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Appearance" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Theme" icon={<Moon size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {(["dark", "light", "system"] as const).map((t, i, arr) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTheme(t)}
              style={[ap.optionRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
            >
              <Text style={ap.optionLabel}>
                {t === "dark" ? "🌙 Dark" : t === "light" ? "☀️ Light" : "⚙️ System"}
              </Text>
              {theme === t && (
                <View style={ap.checkCircle}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <SectionHeader title="Accent Color" icon={<Palette size={12} color={C.dim} strokeWidth={2} />} />
        <Card style={{ padding: 16 }}>
          <View style={ap.accentGrid}>
            {ACCENTS.map((a, i) => (
              <TouchableOpacity key={a.name} onPress={() => setAccentColor(i)} style={ap.accentItem}>
                <View style={[ap.accentDot, { backgroundColor: a.color }, accentColor === i && ap.accentActive]}>
                  {accentColor === i && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={ap.accentName}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <SectionHeader title="Font Size" icon={<Edit3 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {(["small", "medium", "large"] as const).map((s, i, arr) => (
            <TouchableOpacity
              key={s}
              onPress={() => setFontSize(s)}
              style={[ap.optionRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
            >
              <Text style={[ap.optionLabel, s === "small" && { fontSize: 13 }, s === "large" && { fontSize: 17 }]}>
                {s === "small" ? "Small" : s === "medium" ? "Medium" : "Large"}
              </Text>
              {fontSize === s && (
                <View style={ap.checkCircle}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <SectionHeader title="Chat Bubbles" icon={<MessageSquare size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {(["rounded", "sharp"] as const).map((s, i, arr) => (
            <TouchableOpacity
              key={s}
              onPress={() => setBubbleStyle(s)}
              style={[ap.optionRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
            >
              <Text style={ap.optionLabel}>
                {s === "rounded" ? "🫧 Rounded bubbles" : "▬ Sharp bubbles"}
              </Text>
              {bubbleStyle === s && (
                <View style={ap.checkCircle}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

      </ScrollView>
    </Animated.View>
  );
};

const ap = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionLabel: { fontSize: 15, color: C.text, fontWeight: "500" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-around",
  },
  accentItem: { alignItems: "center", gap: 6 },
  accentDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  accentActive: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  accentName: { fontSize: 11, color: C.muted, fontWeight: "500" },
});

// ─── Era Settings Screen ──────────────────────────────────────────────────────

const EraSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    wakeWord: true,
    voiceResponse: true,
    autoSummarise: true,
    digestTime: "8:00 AM",
    voiceMode: true,
    textMode: true,
    smartReplies: true,
    contextMemory: true,
  });

  const toggle = (k: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Era AI Settings" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Era banner */}
        <View style={{ margin: 16 }}>
          <LinearGradient
            colors={["rgba(219,39,119,0.15)", "rgba(124,58,237,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={es.banner}
          >
            <Sparkles size={22} color={C.pink} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={es.bannerTitle}>Era AI</Text>
              <Text style={es.bannerSub}>Your personal voice & chat assistant</Text>
            </View>
          </LinearGradient>
        </View>

        <SectionHeader title="Voice" icon={<Radio size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Mic size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label={`"Hey Era" Wake Word`} toggle toggleValue={settings.wakeWord} onToggle={() => toggle("wakeWord")} />
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Voice Responses" toggle toggleValue={settings.voiceResponse} onToggle={() => toggle("voiceResponse")} />
          <SettingRow icon={<Radio size={18} color="#fff" strokeWidth={2} />} iconBg="#F472B6"
            label="Voice Mode" toggle toggleValue={settings.voiceMode} onToggle={() => toggle("voiceMode")} last />
        </Card>

        <SectionHeader title="Intelligence" icon={<Sparkles size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Sparkles size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Auto-Summarise Chats" toggle toggleValue={settings.autoSummarise} onToggle={() => toggle("autoSummarise")} />
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Smart Replies" toggle toggleValue={settings.smartReplies} onToggle={() => toggle("smartReplies")} />
          <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Context Memory" toggle toggleValue={settings.contextMemory} onToggle={() => toggle("contextMemory")} last />
        </Card>

        <SectionHeader title="Daily Digest" icon={<Bell size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Bell size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Morning Digest" value={settings.digestTime}
            onPress={() => Alert.alert("Digest Time", "Time picker coming soon")} last />
        </Card>

        <SectionHeader title="Danger Zone" icon={<AlertTriangle size={12} color={C.red} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Clear Era Memory" danger
            onPress={() => Alert.alert("Clear Memory", "This will reset all of Era's context and conversation history.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => {} },
            ])} last />
        </Card>

      </ScrollView>
    </Animated.View>
  );
};

const es = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.2)",
  },
  bannerTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  bannerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
});

// ─── Chat Settings Screen ─────────────────────────────────────────────────────

const ChatSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    enterToSend: true,
    autoDownload: false,
    linkPreview: true,
    mediaAutoPlay: false,
    saveToGallery: false,
    showTimestamps: true,
  });
  const toggle = (k: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
      <SubHeader title="Chat Settings" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Compose" icon={<Edit3 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Enter to Send" toggle toggleValue={settings.enterToSend} onToggle={() => toggle("enterToSend")} />
          <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Link Previews" toggle toggleValue={settings.linkPreview} onToggle={() => toggle("linkPreview")} last />
        </Card>

        <SectionHeader title="Media" icon={<Download size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Download size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Auto-Download Media" toggle toggleValue={settings.autoDownload} onToggle={() => toggle("autoDownload")} />
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Auto-Play Videos" toggle toggleValue={settings.mediaAutoPlay} onToggle={() => toggle("mediaAutoPlay")} />
          <SettingRow icon={<Camera size={18} color="#fff" strokeWidth={2} />} iconBg="#EC4899"
            label="Save to Gallery" toggle toggleValue={settings.saveToGallery} onToggle={() => toggle("saveToGallery")} last />
        </Card>

        <SectionHeader title="Display" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Show Timestamps" toggle toggleValue={settings.showTimestamps} onToggle={() => toggle("showTimestamps")} last />
        </Card>

        <SectionHeader title="Storage" icon={<Trash2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Clear Chat Cache" danger
            onPress={() => Alert.alert("Clear Cache", "This will free up storage space. Your messages won't be deleted.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => {} },
            ])} last />
        </Card>

      </ScrollView>
    </Animated.View>
  );
};

// ─── About Screen ─────────────────────────────────────────────────────────────

const AboutScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
    <SubHeader title="About Era Chat" onBack={onBack} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Logo */}
      <View style={{ alignItems: "center", paddingVertical: 32, gap: 12 }}>
        <LinearGradient
          colors={[C.indigoD, C.indigo]}
          style={{ width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 38, fontWeight: "700", color: "#fff" }}>E</Text>
        </LinearGradient>
        <Text style={{ fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 }}>Era Chat</Text>
        <Text style={{ fontSize: 13, color: C.muted }}>Version 1.0.0 (Build 1)</Text>
      </View>

      <Card>
        <SettingRow icon={<Star size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
          label="Rate Era Chat" onPress={() => Alert.alert("Rate Us", "Opening App Store…")} />
        <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
          label="Privacy Policy" onPress={() => Alert.alert("Privacy Policy", "Opening browser…")} />
        <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
          label="Terms of Service" onPress={() => Alert.alert("Terms", "Opening browser…")} />
        <SettingRow icon={<HelpCircle size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
          label="Help & Support" onPress={() => Alert.alert("Support", "support@erachat.app")} />
        <SettingRow icon={<AlertTriangle size={18} color="#fff" strokeWidth={2} />} iconBg={C.amber}
          label="Licenses" onPress={() => Alert.alert("Licenses", "Open source licenses")} last />
      </Card>

      <Text style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 24 }}>
        Made with 🌸 by the Era Team
      </Text>

    </ScrollView>
  </Animated.View>
);

// ─── Main Profile Screen ──────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [section, setSection] = useState<SettingSection>("main");
  const [localUser, setLocalUser] = useState(user);
  const [gradientIndex] = useState(0);

  const headerY = useSharedValue(-10);
  const headerO = useSharedValue(0);

  useEffect(() => {
    headerY.value = withSpring(0, { damping: 14 });
    headerO.value = withTiming(1, { duration: 500 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerO.value,
    transform: [{ translateY: headerY.value }],
  }));

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  const initial = localUser?.displayName?.[0]?.toUpperCase() ?? "A";

  // ── Sub-screens ──
  if (section === "edit_profile") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <EditProfileScreen
        user={localUser}
        onBack={() => setSection("main")}
        onSave={(data) => setLocalUser((u: any) => ({ ...u, ...data }))}
      />
    </SafeAreaView>
  );
  if (section === "notifications") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <NotificationsScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );
  if (section === "privacy") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <PrivacyScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );
  if (section === "appearance") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <AppearanceScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );
  if (section === "era_settings") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <EraSettingsScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );
  if (section === "chat_settings") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ChatSettingsScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );
  if (section === "about") return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <AboutScreen onBack={() => setSection("main")} />
    </SafeAreaView>
  );

  // ── Main profile ──
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Profile card ── */}
        <Animated.View style={[headerStyle]}>
          <LinearGradient
            colors={["rgba(99,102,241,0.12)", "transparent"]}
            style={s.profileCard}
          >
            {/* Avatar */}
            <View style={s.avatarWrap}>
              <LinearGradient
                colors={AVATAR_GRADIENTS[gradientIndex]}
                style={s.avatar}
              >
                <Text style={s.avatarInitial}>{initial}</Text>
              </LinearGradient>
              {/* Online indicator */}
              <View style={s.onlineDot} />
            </View>

            {/* Name & info */}
            <Text style={s.profileName}>
              {localUser?.displayName ?? "Asif Khan"}
            </Text>
            <Text style={s.profileUsername}>
              @{localUser?.username ?? "asifkhan"}
            </Text>
            <Text style={s.profileBio}>
              {(localUser as any)?.bio || "Building Era Chat 🚀 Full-stack dev"}
            </Text>

            {/* Stats */}
            <View style={s.statsRow}>
              {[
                { label: "Chats", value: "24" },
                { label: "Contacts", value: "138" },
                { label: "Messages", value: "1.2k" },
              ].map((stat, i) => (
                <View key={stat.label} style={[s.stat, i < 2 && s.statBorder]}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Edit button */}
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => setSection("edit_profile")}
              activeOpacity={0.85}
            >
              <Edit3 size={15} color={C.indigoL} strokeWidth={2} />
              <Text style={s.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* ── Era AI Section ── */}
        <SectionHeader
          title="Era AI"
          icon={<Sparkles size={12} color={C.pink} strokeWidth={2} />}
        />
        <Card>
          <SettingRow
            icon={<Sparkles size={18} color="#fff" strokeWidth={2} />}
            iconBg="#DB2777"
            label="Era AI Settings"
            value="Configured"
            onPress={() => setSection("era_settings")}
          />
          <SettingRow
            icon={<Radio size={18} color="#fff" strokeWidth={2} />}
            iconBg="#7C3AED"
            label="Voice & Commands"
            value="Hey Era"
            onPress={() => setSection("era_settings")}
            last
          />
        </Card>

        {/* ── Account Section ── */}
        <SectionHeader
          title="Account"
          icon={<User size={12} color={C.dim} strokeWidth={2} />}
        />
        <Card>
          <SettingRow
            icon={<User size={18} color="#fff" strokeWidth={2} />}
            iconBg="#6366F1"
            label="Edit Profile"
            onPress={() => setSection("edit_profile")}
          />
          <SettingRow
            icon={<Bell size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F59E0B"
            label="Notifications"
            badge="3"
            onPress={() => setSection("notifications")}
          />
          <SettingRow
            icon={<Lock size={18} color="#fff" strokeWidth={2} />}
            iconBg="#EF4444"
            label="Privacy & Security"
            onPress={() => setSection("privacy")}
            last
          />
        </Card>

        {/* ── Preferences Section ── */}
        <SectionHeader
          title="Preferences"
          icon={<Palette size={12} color={C.dim} strokeWidth={2} />}
        />
        <Card>
          <SettingRow
            icon={<Palette size={18} color="#fff" strokeWidth={2} />}
            iconBg="#8B5CF6"
            label="Appearance"
            value="Dark"
            onPress={() => setSection("appearance")}
          />
          <SettingRow
            icon={<MessageSquare size={18} color="#fff" strokeWidth={2} />}
            iconBg="#0EA5E9"
            label="Chat Settings"
            onPress={() => setSection("chat_settings")}
          />
          <SettingRow
            icon={<Globe size={18} color="#fff" strokeWidth={2} />}
            iconBg="#10B981"
            label="Language"
            value="English"
            onPress={() => Alert.alert("Language", "Language picker coming soon")}
            last
          />
        </Card>

        {/* ── Support Section ── */}
        <SectionHeader
          title="Support"
          icon={<HelpCircle size={12} color={C.dim} strokeWidth={2} />}
        />
        <Card>
          <SettingRow
            icon={<HelpCircle size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F472B6"
            label="Help & Support"
            onPress={() => Alert.alert("Support", "support@erachat.app")}
          />
          <SettingRow
            icon={<Star size={18} color="#fff" strokeWidth={2} />}
            iconBg="#F59E0B"
            label="Rate Era Chat"
            onPress={() => Alert.alert("Rate Us", "Thanks for the love! 🌸")}
          />
          <SettingRow
            icon={<Info size={18} color="#fff" strokeWidth={2} />}
            iconBg="#6366F1"
            label="About"
            value="v1.0.0"
            onPress={() => setSection("about")}
            last
          />
        </Card>

        {/* ── Danger zone ── */}
        <SectionHeader
          title="Account Actions"
          icon={<AlertTriangle size={12} color={C.red} strokeWidth={2} />}
        />
        <Card>
          <SettingRow
            icon={<LogOut size={18} color="#fff" strokeWidth={2} />}
            iconBg={C.red}
            label="Sign Out"
            danger
            onPress={handleLogout}
            last
          />
        </Card>

        {/* Version footer */}
        <Text style={s.footer}>Era Chat v1.0.0 · Made with 🌸</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },

  profileCard: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 6,
  },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(99,102,241,0.35)",
  },
  avatarInitial: { fontSize: 38, fontWeight: "700", color: "#fff" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.green,
    borderWidth: 3,
    borderColor: C.bg0,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: C.indigoL,
    fontWeight: "500",
  },
  profileBio: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 20,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 16,
    width: "100%",
    overflow: "hidden",
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 3 },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: "500" },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.borderHi,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  editBtnText: {
    fontSize: 14,
    color: C.indigoL,
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: C.dim,
    marginTop: 24,
    marginBottom: 8,
  },
});