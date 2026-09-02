import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";

// ─── Shared color tokens (import these in every profile screen) ──────────────
export const C = {
  bg0: "#0B0E1A",
  bg1: "#111827",
  bg2: "#1a2235",
  bg3: "#252D3D",
  indigo: "#6366F1",
  indigoD: "#4F46E5",
  indigoL: "#818CF8",
  text: "#F1F5F9",
  muted: "#94A3B8",
  dim: "#64748B",
  border: "rgba(255,255,255,0.06)",
  borderHi: "rgba(99,102,241,0.3)",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  pink: "#F472B6",
};

// ─── Sub-screen header (used on every nested settings screen) ────────────────

export   const SubHeader: React.FC<{
  title: string;
  onBack: () => void;
  rightAction?: { label: string; onPress: () => void };
}> = ({ title, onBack, rightAction }) => (
  <View style={sub.wrap}>
    <TouchableOpacity onPress={onBack} style={sub.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={sub.backText}>‹</Text>
    </TouchableOpacity>
    <Text style={sub.title}>{title}</Text>
    {rightAction ? (
      <TouchableOpacity onPress={rightAction.onPress}>
        <Text style={sub.rightAction}>{rightAction.label}</Text>
      </TouchableOpacity>
    ) : (
      <View style={{ width: 36 }} />
    )}
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
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 32, color: C.indigoL, lineHeight: 36, fontWeight: "300" },
  title: { fontSize: 17, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  rightAction: { fontSize: 13, color: C.indigoL, fontWeight: "600" },
});

// ─── Section header label ─────────────────────────────────────────────────────

export const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <View style={sh.wrap}>
    {icon}
    <Text style={sh.title}>{title}</Text>
  </View>
);

const sh = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  title: { fontSize: 11, fontWeight: "700", color: C.dim, letterSpacing: 1, textTransform: "uppercase" },
});

// ─── Card wrapper ──────────────────────────────────────────────────────────────

export const Card: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
  <View style={[cd.wrap, style]}>{children}</View>
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

// ─── Setting row (toggle, navigate, or static value) ──────────────────────────

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

export const SettingRow: React.FC<SettingRowProps> = ({
  icon, iconBg, label, value, toggle, toggleValue, onToggle, onPress, danger, badge, last,
}) => {
  const scale = useSharedValue(1);
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={rowStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { if (onPress) scale.value = withTiming(0.985, { duration: 100 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        activeOpacity={toggle ? 1 : 0.85}
        disabled={toggle}
      >
        <View style={[sr.wrap, !last && sr.border]}>
          <View style={[sr.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
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
            {!toggle && onPress && <ChevronRight size={16} color={C.dim} strokeWidth={2} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const sr = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 13, gap: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: C.border },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, fontSize: 15, color: C.text, fontWeight: "500" },
  dangerLabel: { color: C.red },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 13, color: C.muted },
  badge: { backgroundColor: C.indigo, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
});

// ─── Option row (radio-style selection, used in appearance/language) ─────────

export const OptionRow: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  last?: boolean;
}> = ({ label, selected, onPress, last }) => (
  <TouchableOpacity onPress={onPress} style={[or.row, !last && or.border]}>
    <Text style={or.label}>{label}</Text>
    {selected && (
      <View style={or.checkCircle}>
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

const or = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: C.border },
  label: { fontSize: 15, color: C.text, fontWeight: "500" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" },
});
