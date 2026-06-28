import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/lib/constants";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingSlide {
  id: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  accentColor: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to",
    titleAccent: "Era ✦",
    subtitle:
      "Your AI-powered community platform. Conversations that feel alive, connections that last.",
    accentColor: "#818CF8",
  },
  {
    id: "chat",
    title: "Chat that feels",
    titleAccent: "alive",
    subtitle:
      "Real-time messaging with voice notes, read receipts, typing indicators, and instant delivery.",
    accentColor: "#6366F1",
  },
  {
    id: "era",
    title: "Meet Era, your",
    titleAccent: "AI companion",
    subtitle:
      'Just say "Hey Era" — she reads your messages, summarises conversations, and replies hands-free.',
    accentColor: "#818CF8",
  },
  {
    id: "contacts",
    title: "Everyone you need,",
    titleAccent: "always close",
    subtitle:
      "Contacts, live presence, push notifications — all in one beautifully minimal space.",
    accentColor: "#6366F1",
  },
];

// ─── Orb Background ──────────────────────────────────────────────────────────

const OrbBackground: React.FC<{ slide: number }> = ({ slide }) => {
  const orb1Scale = useSharedValue(1);
  const orb2Scale = useSharedValue(1);

  useEffect(() => {
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      false
    );
    orb2Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000 }),
        withTiming(1, { duration: 4000 })
      ),
      -1,
      false
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb1Scale.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb2Scale.value }],
  }));

  const configs = [
    // slide 0 — welcome: centered massive glow
    {
      o1: { top: SCREEN_H * 0.12, left: SCREEN_W / 2 - 160, right: undefined, w: 320, h: 320, color: "rgba(99,102,241,0.18)" },
      o2: { bottom: 60, right: -60, left: undefined, w: 200, h: 200, color: "rgba(129,140,248,0.1)" },
    },
    // slide 1 — chat
    {
      o1: { top: -80, right: -60, left: undefined, w: 220, h: 220, color: "rgba(99,102,241,0.25)" },
      o2: { bottom: 80, left: -60, right: undefined, w: 170, h: 170, color: "rgba(139,92,246,0.15)" },
    },
    // slide 2 — era
    {
      o1: { top: 40, left: -70, right: undefined, w: 240, h: 240, color: "rgba(99,102,241,0.2)" },
      o2: { bottom: 100, right: -40, left: undefined, w: 180, h: 180, color: "rgba(34,197,94,0.1)" },
    },
    // slide 3 — contacts
    {
      o1: { top: -60, left: SCREEN_W / 2 - 120, right: undefined, w: 240, h: 240, color: "rgba(129,140,248,0.18)" },
      o2: { bottom: 60, right: -50, left: undefined, w: 190, h: 190, color: "rgba(99,102,241,0.14)" },
    },
  ];

  const cfg = configs[slide] ?? configs[1];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.orb,
          orb1Style,
          {
            top: cfg.o1.top,
            right: cfg.o1.right,
            left: cfg.o1.left,
            width: cfg.o1.w,
            height: cfg.o1.h,
            backgroundColor: cfg.o1.color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          orb2Style,
          {
            bottom: cfg.o2.bottom,
            left: cfg.o2.left,
            right: cfg.o2.right,
            width: cfg.o2.w,
            height: cfg.o2.h,
            backgroundColor: cfg.o2.color,
          },
        ]}
      />
    </View>
  );
};

// ─── Progress Dots ────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === current ? 24 : 6,
            backgroundColor:
              i === current ? COLORS.indigo.primary : COLORS.text.disabled,
          },
        ]}
      />
    ))}
  </View>
);

// ─── Typing Dot ───────────────────────────────────────────────────────────────

const TypingDot: React.FC<{ index: number }> = ({ index }) => {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withDelay(index * 180, withTiming(-5, { duration: 280 })),
        withTiming(0, { duration: 280 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.text.disabled }, style]}
    />
  );
};

const TypingDots: React.FC = () => (
  <View style={{ flexDirection: "row", gap: 4, paddingVertical: 2 }}>
    <TypingDot index={0} />
    <TypingDot index={1} />
    <TypingDot index={2} />
  </View>
);

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

const ChatBubble: React.FC<{
  text: string;
  side: "left" | "right" | "era";
  delay?: number;
  showTyping?: boolean;
}> = ({ text, side, delay = 0, showTyping = false }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  const isRight = side === "right";
  const isEra = side === "era";
  return (
    <Animated.View style={[animStyle, styles.bubbleRow, { justifyContent: isRight ? "flex-end" : "flex-start" }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isRight ? COLORS.indigo.primary : isEra ? "rgba(99,102,241,0.15)" : "#1E2535",
            borderColor: isEra ? "rgba(99,102,241,0.3)" : "transparent",
            borderWidth: isEra ? 1 : 0,
            borderBottomLeftRadius: !isRight ? 4 : 18,
            borderBottomRightRadius: isRight ? 4 : 18,
          },
        ]}
      >
        {showTyping ? (
          <TypingDots />
        ) : (
          <Text style={[styles.bubbleText, { color: isRight ? "#fff" : isEra ? COLORS.indigo.light : COLORS.text.primary }]}>
            {text}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Wave Bar ─────────────────────────────────────────────────────────────────

const WaveBar: React.FC<{ targetHeight: number; index: number }> = ({ targetHeight, index }) => {
  const h = useSharedValue(4);
  useEffect(() => {
    const duration = 900 + Math.random() * 600;
    h.value = withRepeat(
      withSequence(withDelay(index * 60, withTiming(targetHeight, { duration })), withTiming(4, { duration })),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    height: h.value,
    opacity: interpolate(h.value, [4, targetHeight], [0.4, 1], Extrapolation.CLAMP),
  }));
  return <Animated.View style={[styles.waveBar, style]} />;
};

// ─── Contact Row ──────────────────────────────────────────────────────────────

const ContactRow: React.FC<{
  contact: { name: string; status: string; statusColor: string; badge: number; avatarColor: [string, string]; initial: string };
  isHighlighted: boolean;
}> = ({ contact, isHighlighted }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(isHighlighted ? 1 : 0, { duration: 400 });
  }, [isHighlighted]);
  const rowStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(99,102,241,${interpolate(progress.value, [0, 1], [0.05, 0.4], Extrapolation.CLAMP)})`,
    backgroundColor: `rgba(99,102,241,${interpolate(progress.value, [0, 1], [0, 0.07], Extrapolation.CLAMP)})`,
  }));
  return (
    <Animated.View style={[styles.contactRow, rowStyle]}>
      <LinearGradient colors={contact.avatarColor} style={styles.cAvatar}>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{contact.initial}</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text.primary }}>{contact.name}</Text>
        <Text style={{ fontSize: 12, color: contact.statusColor, marginTop: 1 }}>{contact.status}</Text>
      </View>
      {contact.badge > 0 && (
        <View style={styles.badge}>
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{contact.badge}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ─── SLIDE 0: Glowing Era Welcome Illustration ────────────────────────────────

const GlowingEraIllustration: React.FC = () => {
  // Core pulse
  const corePulse = useSharedValue(1);
  // Ring 1 — slow rotate
  const ring1Rot = useSharedValue(0);
  // Ring 2 — opposite rotate
  const ring2Rot = useSharedValue(0);
  // Ripple rings expand outward
  const ripple1Scale = useSharedValue(1);
  const ripple1Opacity = useSharedValue(0.6);
  const ripple2Scale = useSharedValue(1);
  const ripple2Opacity = useSharedValue(0.6);
  const ripple3Scale = useSharedValue(1);
  const ripple3Opacity = useSharedValue(0.6);
  // Floating particles
  const p1Y = useSharedValue(0);
  const p2Y = useSharedValue(0);
  const p3Y = useSharedValue(0);
  const p4Y = useSharedValue(0);
  const p1O = useSharedValue(0.4);
  const p2O = useSharedValue(0.6);
  const p3O = useSharedValue(0.3);
  const p4O = useSharedValue(0.5);
  // Text fade in
  const textO = useSharedValue(0);
  const textY = useSharedValue(16);
  // Star sparkle
  const sparkleRot = useSharedValue(0);
  const sparkleScale = useSharedValue(1);

  useEffect(() => {
    // Core breathe
    corePulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 2200 }), withTiming(1, { duration: 2200 })),
      -1, true
    );
    // Orbital rings
    ring1Rot.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
    ring2Rot.value = withRepeat(withTiming(-360, { duration: 14000 }), -1, false);
    // Ripples — staggered outward expand
    ripple1Scale.value = withRepeat(withTiming(2.8, { duration: 2400 }), -1, false);
    ripple1Opacity.value = withRepeat(withTiming(0, { duration: 2400 }), -1, false);
    ripple2Scale.value = withRepeat(
      withSequence(withDelay(800, withTiming(2.8, { duration: 2400 }))),
      -1, false
    );
    ripple2Opacity.value = withRepeat(
      withSequence(withDelay(800, withTiming(0, { duration: 2400 }))),
      -1, false
    );
    ripple3Scale.value = withRepeat(
      withSequence(withDelay(1600, withTiming(2.8, { duration: 2400 }))),
      -1, false
    );
    ripple3Opacity.value = withRepeat(
      withSequence(withDelay(1600, withTiming(0, { duration: 2400 }))),
      -1, false
    );
    // Floating particles — each bobs at its own rhythm
    p1Y.value = withRepeat(withSequence(withTiming(-12, { duration: 2000 }), withTiming(0, { duration: 2000 })), -1, true);
    p2Y.value = withRepeat(withSequence(withDelay(400, withTiming(-10, { duration: 1800 })), withTiming(0, { duration: 1800 })), -1, true);
    p3Y.value = withRepeat(withSequence(withDelay(800, withTiming(-14, { duration: 2400 })), withTiming(0, { duration: 2400 })), -1, true);
    p4Y.value = withRepeat(withSequence(withDelay(200, withTiming(-8, { duration: 1600 })), withTiming(0, { duration: 1600 })), -1, true);
    p1O.value = withRepeat(withSequence(withTiming(0.9, { duration: 1800 }), withTiming(0.3, { duration: 1800 })), -1, true);
    p2O.value = withRepeat(withSequence(withDelay(600, withTiming(1, { duration: 2000 })), withTiming(0.3, { duration: 2000 })), -1, true);
    p3O.value = withRepeat(withSequence(withDelay(300, withTiming(0.8, { duration: 2200 })), withTiming(0.2, { duration: 2200 })), -1, true);
    p4O.value = withRepeat(withSequence(withDelay(900, withTiming(0.9, { duration: 1400 })), withTiming(0.3, { duration: 1400 })), -1, true);
    // Text entrance
    textO.value = withDelay(400, withTiming(1, { duration: 700 }));
    textY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 100 }));
    // Sparkle spin
    sparkleRot.value = withRepeat(withTiming(360, { duration: 6000 }), -1, false);
    sparkleScale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 1800 }), withTiming(0.85, { duration: 1800 })),
      -1, true
    );
  }, []);

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: corePulse.value }] }));
  const ring1Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${ring1Rot.value}deg` }] }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${ring2Rot.value}deg` }] }));
  const rp1Style = useAnimatedStyle(() => ({ transform: [{ scale: ripple1Scale.value }], opacity: ripple1Opacity.value }));
  const rp2Style = useAnimatedStyle(() => ({ transform: [{ scale: ripple2Scale.value }], opacity: ripple2Opacity.value }));
  const rp3Style = useAnimatedStyle(() => ({ transform: [{ scale: ripple3Scale.value }], opacity: ripple3Opacity.value }));
  const pt1Style = useAnimatedStyle(() => ({ transform: [{ translateY: p1Y.value }], opacity: p1O.value }));
  const pt2Style = useAnimatedStyle(() => ({ transform: [{ translateY: p2Y.value }], opacity: p2O.value }));
  const pt3Style = useAnimatedStyle(() => ({ transform: [{ translateY: p3Y.value }], opacity: p3O.value }));
  const pt4Style = useAnimatedStyle(() => ({ transform: [{ translateY: p4Y.value }], opacity: p4O.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textO.value, transform: [{ translateY: textY.value }] }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRot.value}deg` }, { scale: sparkleScale.value }],
  }));

  // Particle positions around the orb
  const PARTICLES = [
    { x: -90, y: -55, size: 5, color: "#818CF8", style: pt1Style },
    { x: 80,  y: -70, size: 4, color: "#A5B4FC", style: pt2Style },
    { x: 100, y: 30,  size: 6, color: "#6366F1", style: pt3Style },
    { x: -80, y: 50,  size: 4, color: "#C7D2FE", style: pt4Style },
  ];

  return (
    // Full-bleed — no card border, pure dark canvas
    <View style={styles.eraWelcomeWrap}>
      {/* Deep glow behind everything */}
      <View style={styles.eraDeepGlow} />

      {/* Orb cluster */}
      <View style={styles.eraOrbCluster}>
        {/* Ripple rings */}
        <Animated.View style={[styles.eraRipple, rp1Style]} />
        <Animated.View style={[styles.eraRipple, rp2Style]} />
        <Animated.View style={[styles.eraRipple, rp3Style]} />

        {/* Outer orbital ring with a dot rider */}
        <Animated.View style={[styles.eraOrbitRing2, ring2Style]}>
          <View style={[styles.eraOrbitDot, { backgroundColor: "#A5B4FC", top: -4, left: "50%" }]} />
        </Animated.View>

        {/* Inner orbital ring with a dot rider */}
        <Animated.View style={[styles.eraOrbitRing1, ring1Style]}>
          <View style={[styles.eraOrbitDot, { backgroundColor: "#818CF8", top: -5, right: 10 }]} />
        </Animated.View>

        {/* Core orb */}
        <Animated.View style={coreStyle}>
          <LinearGradient
            colors={["#312E81", "#4338CA", "#6366F1", "#818CF8"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.eraCoreOrb}
          >
            {/* Inner shine */}
            <View style={styles.eraCoreShine} />
            {/* Sparkle icon */}
            <Animated.Text style={[styles.eraCoreSymbol, sparkleStyle]}>✦</Animated.Text>
          </LinearGradient>
        </Animated.View>

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.eraParticle,
              {
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                left: "50%",
                top: "50%",
                marginLeft: p.x,
                marginTop: p.y,
              },
              p.style,
            ]}
          />
        ))}
      </View>

      {/* Text beneath orb */}
      <Animated.View style={[styles.eraWelcomeTextWrap, textStyle]}>
        <View style={styles.eraLiveChip}>
          <View style={styles.eraLiveDot} />
          <Text style={styles.eraLiveText}>ERA ONLINE</Text>
        </View>
        <Text style={styles.eraWelcomeTitle}>Era is ready</Text>
        <Text style={styles.eraWelcomeCaption}>
          Your AI companion is awake and waiting.{"\n"}Tap to begin.
        </Text>
      </Animated.View>
    </View>
  );
};

// ─── Slide 1: Chat Illustration ───────────────────────────────────────────────

const ChatIllustration: React.FC = () => (
  <View style={styles.illustrationWrap}>
    <View style={styles.onlineBadge}>
      <View style={styles.onlineDot} />
      <Text style={styles.onlineBadgeText}>Alex is online</Text>
    </View>
    <View style={{ gap: 10, marginTop: 12 }}>
      <ChatBubble text="Hey! Did you see the new update? 👀" side="left" delay={100} />
      <ChatBubble text="Yeah it's wild 🔥 I sent you a voice note" side="right" delay={300} />
      <ChatBubble text="🤖 Hey Era, summarize our chat!" side="era" delay={500} />
      <ChatBubble text="" side="left" delay={700} showTyping />
    </View>
    <View style={{ alignItems: "flex-end", marginTop: 4 }}>
      <Text style={{ fontSize: 11, color: COLORS.indigo.light }}>✓✓ Read 9:42 AM</Text>
    </View>
  </View>
);

// ─── Slide 2: Era Illustration ────────────────────────────────────────────────

const WAVE_BARS = [8, 14, 22, 18, 30, 24, 36, 28, 20, 32, 16, 26, 34, 18, 12, 28, 22, 36, 16, 24];

const EraIllustration: React.FC = () => {
  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0.7);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0.7);

  useEffect(() => {
    ring1Scale.value = withRepeat(withTiming(2.2, { duration: 2000 }), -1, false);
    ring1Opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
    ring2Scale.value = withRepeat(withSequence(withDelay(800, withTiming(2.2, { duration: 2000 }))), -1, false);
    ring2Opacity.value = withRepeat(withSequence(withDelay(800, withTiming(0, { duration: 2000 }))), -1, false);
  }, []);

  const r1Style = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }], opacity: ring1Opacity.value }));
  const r2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }], opacity: ring2Opacity.value }));

  return (
    <View style={styles.illustrationWrap}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[styles.rippleRing, r1Style, { width: 80, height: 80, borderRadius: 40 }]} />
          <Animated.View style={[styles.rippleRing, r2Style, { width: 80, height: 80, borderRadius: 40 }]} />
          <LinearGradient colors={[COLORS.indigo.dark, COLORS.indigo.primary]} style={styles.eraAvatar}>
            <Text style={{ fontSize: 28, color: "#fff", fontWeight: "700" }}>✦</Text>
          </LinearGradient>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.text.muted, marginTop: 8, letterSpacing: 1 }}>
          ERA IS LISTENING…
        </Text>
      </View>
      <View style={styles.waveform}>
        {WAVE_BARS.map((h, i) => (
          <WaveBar key={i} targetHeight={h} index={i} />
        ))}
      </View>
      <View style={styles.eraQuote}>
        <Text style={{ fontSize: 13, color: COLORS.text.secondary, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
          "You have 3 unread messages from Alex. Want me to read them?"
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 12 }}>
        {["🎤 Voice input", "🧠 AI powered", "🔊 Voice reply"].map((chip) => (
          <View key={chip} style={styles.chip}>
            <Text style={{ fontSize: 12, color: COLORS.indigo.light }}>{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Slide 3: Contacts Illustration ──────────────────────────────────────────

const CONTACTS = [
  { name: "Alex Chen", status: "Online now", statusColor: "#22C55E", badge: 3, avatarColor: ["#6366F1", "#8B5CF6"] as [string, string], initial: "A" },
  { name: "Maya Patel", status: "Last seen 5m ago", statusColor: COLORS.text.muted, badge: 1, avatarColor: ["#EC4899", "#F43F5E"] as [string, string], initial: "M" },
  { name: "Jordan Lee", status: "Sent a voice note 🎙️", statusColor: COLORS.text.muted, badge: 0, avatarColor: ["#F59E0B", "#EF4444"] as [string, string], initial: "J" },
];

const ContactsIllustration: React.FC = () => {
  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setHighlighted((v) => (v + 1) % 3), 1800);
    return () => clearInterval(interval);
  }, []);
  return (
    <View style={styles.illustrationWrap}>
      {CONTACTS.map((c, i) => (
        <ContactRow key={c.name} contact={c} isHighlighted={highlighted === i} />
      ))}
      <View style={styles.notifCard}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text.primary, marginBottom: 2 }}>Alex sent a voice note</Text>
          <Text style={{ fontSize: 12, color: COLORS.text.muted, lineHeight: 17 }}>Era can play it back for you, hands-free.</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ILLUSTRATIONS = [GlowingEraIllustration, ChatIllustration, EraIllustration, ContactsIllustration];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const btnScale = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const contentTranslate = useSharedValue(0);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentTranslate.value }],
  }));

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      contentOpacity.value = withTiming(0, { duration: 200 });
      contentTranslate.value = withTiming(-30, { duration: 200 });
      setTimeout(() => {
        setCurrentSlide((s) => s + 1);
        contentTranslate.value = 30;
        contentOpacity.value = withTiming(1, { duration: 300 });
        contentTranslate.value = withTiming(0, { duration: 300 });
      }, 200);
    } else {
      router.push("/(auth)/register");
    }
  };

  const slide = SLIDES[currentSlide];
  const Illustration = ILLUSTRATIONS[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const isFirst = currentSlide === 0;

  return (
    <SafeAreaView style={styles.container}>
      <OrbBackground slide={currentSlide} />

      <View style={styles.header}>
        <View />
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[{ flex: 1, width: "100%" }, contentStyle]}>
        <View style={[styles.illustrationContainer, isFirst && styles.illustrationContainerFirst]}>
          <Illustration />
        </View>

        {/* Slide 0 has no text block — it's all in the illustration */}
        {!isFirst && (
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              {slide.title}{"\n"}
              <Text style={[styles.titleAccent, { color: slide.accentColor }]}>
                {slide.titleAccent}
              </Text>
            </Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.bottomArea}>
        <ProgressDots total={SLIDES.length} current={currentSlide} />

        <Animated.View style={[{ width: "100%" }, btnStyle]}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 15 }); }}
            onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
            onPress={goNext}
          >
            <LinearGradient
              colors={["#312E81", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {isFirst ? "Meet Era ✦" : isLast ? "Get Started →" : "Continue →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={[styles.skipText, isLast && { color: COLORS.indigo.light }]}>
            {isLast ? "Already have an account? Sign in" : "Skip to Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: "center",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.text.muted,
    fontWeight: "500",
  },
  illustrationContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  illustrationContainerFirst: {
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationWrap: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },

  // ── Glowing Era Welcome (slide 0) ──────────────────────────────
  eraWelcomeWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  eraDeepGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.13)",
    top: "10%",
    alignSelf: "center",
  },
  eraOrbCluster: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  eraRipple: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: "rgba(99,102,241,0.5)",
  },
  eraOrbitRing1: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.35)",
    borderStyle: "dashed",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  eraOrbitRing2: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  eraOrbitDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eraCoreOrb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    // Simulated glow via border
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.6)",
  },
  eraCoreShine: {
    position: "absolute",
    top: 12,
    left: 18,
    width: 32,
    height: 18,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    transform: [{ rotate: "-30deg" }],
  },
  eraCoreSymbol: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "700",
  },
  eraParticle: {
    position: "absolute",
  },
  eraWelcomeTextWrap: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  eraLiveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(99,102,241,0.12)",
    borderColor: "rgba(99,102,241,0.3)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  eraLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
  eraLiveText: {
    fontSize: 11,
    color: "#A5B4FC",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  eraWelcomeTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: "center",
  },
  eraWelcomeCaption: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 24,
    textAlign: "center",
  },

  // ── Shared ─────────────────────────────────────────────────────
  textBlock: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.text.primary,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: COLORS.indigo.primary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.muted,
    lineHeight: 24,
  },
  bottomArea: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 14,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  primaryBtn: {
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  bubbleRow: { flexDirection: "row" },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "80%",
  },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.25)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  onlineBadgeText: { fontSize: 11, color: "#4ade80", fontWeight: "500" },
  eraAvatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center", zIndex: 10,
  },
  rippleRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(99,102,241,0.45)",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 40,
    justifyContent: "center",
    marginVertical: 8,
  },
  waveBar: { width: 4, borderRadius: 4, backgroundColor: COLORS.indigo.primary },
  eraQuote: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderColor: "rgba(99,102,241,0.22)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  chip: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderColor: "rgba(99,102,241,0.22)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.indigo.primary,
    alignItems: "center", justifyContent: "center",
  },
  notifCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: COLORS.bg.tertiary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.indigo.primary,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
});