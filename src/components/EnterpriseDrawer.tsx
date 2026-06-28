import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Home,
  Sparkles,
  Zap,
  User,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Pin,
  Archive,
  BarChart3,
  HelpCircle,
  Bug,
  Lightbulb,
  LogOut,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth.store";
import { usePulse } from "@/hooks/usePulse";

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg0: "#0B0E1A",
  bg1: "#111827",
  bg2: "#1a2235",
  indigo: "#6366F1",
  indigoD: "#4F46E5",
  indigoL: "#818CF8",
  text: "#F1F5F9",
  muted: "#94A3B8",
  dim: "#64748B",
  border: "rgba(255,255,255,0.06)",
  green: "#22C55E",
  red: "#EF4444",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.FC<any>;
  route: string;
  badge?: number;
}

interface AppItem {
  label: string;
  icon: React.FC<any>;
  connected: boolean;
  badge?: number;
  color: string;
  route: string;
}

interface ToolItem {
  label: string;
  icon: React.FC<any>;
  route: string;
}

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text style={sl.text}>{text}</Text>
);

const sl = StyleSheet.create({
  text: {
    fontSize: 11,
    fontWeight: "700",
    color: C.dim,
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
});

// ─── Nav row ──────────────────────────────────────────────────────────────────

const DrawerRow: React.FC<{
  icon: React.FC<any>;
  label: string;
  onPress: () => void;
  badge?: number;
  active?: boolean;
  rightText?: string;
  iconColor?: string;
  dim?: boolean;
}> = ({ icon: Icon, label, onPress, badge, active, rightText, iconColor, dim }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View style={[dr.row, active && dr.rowActive]}>
      <View style={[dr.iconWrap, active && dr.iconWrapActive]}>
        <Icon size={17} color={active ? "#fff" : (iconColor ?? C.muted)} strokeWidth={2} />
      </View>
      <Text
        style={[dr.label, active && dr.labelActive, dim && dr.labelDim]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {rightText && <Text style={dr.rightText}>{rightText}</Text>}
      {badge !== undefined && badge > 0 && (
        <View style={dr.badge}>
          <Text style={dr.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const dr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  rowActive: { backgroundColor: C.indigo },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  iconWrapActive: { backgroundColor: "rgba(255,255,255,0.18)" },
  label: { flex: 1, fontSize: 14, fontWeight: "500", color: C.text },
  labelActive: { color: "#fff", fontWeight: "600" },
  labelDim: { color: C.muted },
  rightText: { fontSize: 11, color: C.dim, fontWeight: "500" },
  badge: {
    backgroundColor: C.indigo,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: "#fff" },
});

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = () => <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12, marginHorizontal: 16 }} />;

// ─── Main Drawer Component ─────────────────────────────────────────────────────

export default function EnterpriseDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadNotifications, dueTodayCount } = usePulse();

  const closeDrawer = () => props.navigation.closeDrawer();

  const navigateTo = (route: string) => {
    closeDrawer();
    router.push(route as any);
  };

  const activeRoute = props.state.routeNames[props.state.index];

  // ── Primary navigation ──
  const PRIMARY_NAV: NavItem[] = [
    { label: "Home (Chats)", icon: Home,         route: "/(drawer)/(tabs)/chats" },
    { label: "Era AI",       icon: Sparkles,      route: "/(drawer)/(tabs)/era"   },
    { label: "Pulse",        icon: Zap,           route: "/(drawer)/(tabs)/pulse", badge: unreadNotifications + dueTodayCount },
    { label: "Space",        icon: User,          route: "/(drawer)/(tabs)/space" },
  ];

  // ── Connected apps ──
  const CONNECTED_APPS: AppItem[] = [
    { label: "Gmail",            icon: Mail,        connected: true,  badge: 12, color: "#EA4335", route: "/(drawer)/(tabs)/era/tools/gmail" },
    { label: "Google Calendar",  icon: Calendar,    connected: true,  badge: 3,  color: "#4285F4", route: "/(drawer)/(tabs)/era/tools/calendar" },
    { label: "Notion",           icon: FileText,    connected: false, color: "#fff",     route: "/(drawer)/(tabs)/space/integrations/notion" },
    { label: "Slack",            icon: MessageSquare,connected: false, color: "#4A154B", route: "/(drawer)/(tabs)/space/integrations/slack" },
  ];

  // ── Tools ──
  const TOOLS: ToolItem[] = [
    { label: "Search Everything", icon: Search,   route: "/modals/search-global"        },
    { label: "Saved Messages",    icon: Pin,       route: "/(drawer)/(tabs)/chats?filter=pinned" },
    { label: "Archive",           icon: Archive,   route: "/(drawer)/(tabs)/chats?filter=archived" },
    { label: "Era Analytics",     icon: BarChart3, route: "/(drawer)/(tabs)/space/analytics" },
  ];

  // ── Support ──
  const SUPPORT: ToolItem[] = [
    { label: "Help Center",      icon: HelpCircle, route: "/(drawer)/(tabs)/space/support" },
    { label: "Report a Bug",     icon: Bug,         route: "/(drawer)/(tabs)/space/support/bug" },
    { label: "Feature Request",  icon: Lightbulb,   route: "/(drawer)/(tabs)/space/support/feedback" },
  ];

  const handleSignOut = () => {
    closeDrawer();
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => await logout() },
    ]);
  };

  const initial = user?.displayName?.[0]?.toUpperCase() ?? "A";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* ── Section 1: User identity card ── */}
          <TouchableOpacity
            onPress={() => navigateTo("/(drawer)/(tabs)/space")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(99,102,241,0.15)", "transparent"]}
              style={uc.wrap}
            >
              <View style={uc.avatarWrap}>
                <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={uc.avatar}>
                  <Text style={uc.avatarText}>{initial}</Text>
                </LinearGradient>
                <View style={uc.onlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={uc.name} numberOfLines={1}>
                  {user?.displayName ?? "Asif Khan"}
                </Text>
                <Text style={uc.username} numberOfLines={1}>
                  @{user?.username ?? "asifkhan"}
                </Text>
              </View>
              <ChevronRight size={16} color={C.dim} strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>

          <Divider />

          {/* ── Section 2: Primary navigation ── */}
          <View style={{ gap: 2 }}>
            {PRIMARY_NAV.map((item) => (
              <DrawerRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={activeRoute === "(tabs)" && item.route.includes(activeRoute)}
                onPress={() => navigateTo(item.route)}
              />
            ))}
          </View>

          <Divider />

          {/* ── Section 3: Connected apps ── */}
          <SectionLabel text="Connected Apps" />
          <View style={{ gap: 2 }}>
            {CONNECTED_APPS.map((app) => (
              <DrawerRow
                key={app.label}
                icon={app.icon}
                label={app.label}
                badge={app.connected ? app.badge : undefined}
                rightText={!app.connected ? "Connect" : undefined}
                dim={!app.connected}
                onPress={() => navigateTo(app.route)}
              />
            ))}
            <DrawerRow
              icon={Plus}
              label="Add Integration"
              iconColor={C.indigoL}
              onPress={() => navigateTo("/(drawer)/(tabs)/space/integrations")}
            />
          </View>

          <Divider />

          {/* ── Section 4: Tools ── */}
          <SectionLabel text="Tools" />
          <View style={{ gap: 2 }}>
            {TOOLS.map((tool) => (
              <DrawerRow
                key={tool.label}
                icon={tool.icon}
                label={tool.label}
                onPress={() => navigateTo(tool.route)}
              />
            ))}
          </View>

          <Divider />

          {/* ── Section 5: Support & account ── */}
          <SectionLabel text="Support" />
          <View style={{ gap: 2 }}>
            {SUPPORT.map((item) => (
              <DrawerRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                onPress={() => navigateTo(item.route)}
              />
            ))}
          </View>

          <Divider />

          <DrawerRow
            icon={LogOut}
            label="Sign Out"
            iconColor={C.red}
            onPress={handleSignOut}
          />

        </ScrollView>

        {/* Footer */}
        <View style={ft.wrap}>
          <Text style={ft.text}>Era Chat v1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const uc = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(99,102,241,0.4)",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.bg0,
  },
  name: { fontSize: 16, fontWeight: "700", color: C.text },
  username: { fontSize: 12, color: C.indigoL, marginTop: 1 },
});

const ft = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  text: { fontSize: 11, color: C.dim, textAlign: "center" },
});