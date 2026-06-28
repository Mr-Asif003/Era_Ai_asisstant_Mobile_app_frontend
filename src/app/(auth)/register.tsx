import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/lib/constants";

import { AuthService } from "../../services/auth.service";


// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  number:string
}

interface FormErrors {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  number?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(v: FormState): FormErrors {
  const e: FormErrors = {};
  if (!v.displayName.trim()) e.displayName = "Display name is required";
  else if (v.displayName.trim().length < 2) e.displayName = "At least 2 characters";
  
//number validation
 if(!v.number.trim()) e.number = "Phone number is required";
 if(v.number.length<10) e.number = "Phone number must be at least 10 digits";

  if (!v.username.trim()) e.username = "Username is required";
  else if (!/^[a-zA-Z0-9_]{3,20}$/.test(v.username))
    e.username = "3–20 chars, letters/numbers/underscore only";

  if (!v.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = "Enter a valid email";

  if (!v.password) e.password = "Password is required";
  else if (v.password.length < 8) e.password = "At least 8 characters";
  else if (!/[A-Z]/.test(v.password)) e.password = "Include at least one uppercase letter";
  else if (!/[0-9]/.test(v.password)) e.password = "Include at least one number";

  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match";
  if(!v.number.length) e.number = "Phone number is required";
  if(!v.number.trim()) e.number = "Phone number is required";

  return e;
}

// ─── Password Strength ────────────────────────────────────────────────────────

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#EF4444" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#F59E0B" };
  if (score <= 3) return { score: 3, label: "Good", color: "#3B82F6" };
  return { score: 4, label: "Strong", color: "#22C55E" };
}

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <View style={sb.wrap}>
      <View style={sb.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              sb.bar,
              {
                backgroundColor:
                  i <= strength.score ? strength.color : "rgba(255,255,255,0.08)",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[sb.label, { color: strength.color }]}>{strength.label}</Text>
    </View>
  );
};

const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  bars: { flexDirection: "row", gap: 4, flex: 1 },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  label: { fontSize: 11, fontWeight: "600", minWidth: 40, textAlign: "right" },
});

// ─── Input Field (inline — same pattern as login) ─────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "words";
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  hint?: string;
  showStrength?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  returnKeyType = "next",
  onSubmitEditing,
  hint,
  showStrength = false,
}) => {
  const [show, setShow] = useState(false);
  const borderAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? "#EF4444"
      : `rgba(99,102,241,${borderAnim.value})`,
  }));

  const isPassword = secureTextEntry;

  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <Animated.View style={[f.inputWrap, borderStyle, error ? f.err : null]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={[f.input, { flex: 1 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.disabled}
            secureTextEntry={isPassword && !show}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            onFocus={() => { borderAnim.value = withTiming(1, { duration: 200 }); }}
            onBlur={() => { borderAnim.value = withTiming(0, { duration: 200 }); }}
            selectionColor={COLORS.indigo.primary}
            autoCorrect={false}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setShow((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 12, color: COLORS.indigo.light, fontWeight: "500" }}>
                {show ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {showStrength && <StrengthBar password={value} />}
      {error ? <Text style={f.errText}>{error}</Text> : null}
      {hint && !error ? <Text style={f.hint}>{hint}</Text> : null}
    </View>
  );
};

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.secondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrap: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  err: { borderColor: "#EF4444" },
  input: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  errText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.text.disabled,
    marginTop: 6,
    marginLeft: 4,
  },
});

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <View style={si.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          si.step,
          i < current
            ? si.done
            : i === current
            ? si.active
            : si.inactive,
        ]}
      />
    ))}
    <Text style={si.label}>
      Step {current + 1} of {total}
    </Text>
  </View>
);

const si = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 28 },
  step: { height: 4, borderRadius: 2, flex: 1 },
  done: { backgroundColor: COLORS.indigo.primary },
  active: { backgroundColor: COLORS.indigo.light },
  inactive: { backgroundColor: "rgba(255,255,255,0.08)" },
  label: {
    fontSize: 12,
    color: COLORS.text.disabled,
    marginLeft: 4,
    fontWeight: "500",
  },
});

// ─── Loading Dot ──────────────────────────────────────────────────────────────

const LoadingDot: React.FC<{ index: number }> = ({ index }) => {
  const scale = useSharedValue(0.6);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.6, { duration: 300 })
        ),
        -1,
        false
      );
    }, index * 150);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View
      style={[
        { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff", marginHorizontal: 3 },
        style,
      ]}
    />
  );
};

// ─── Register Screen ──────────────────────────────────────────────────────────

const TOTAL_STEPS = 2;

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    number:"",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const shakeX = useSharedValue(0);
  const btnScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formTranslate = useSharedValue(24);
  const slideX = useSharedValue(0);

  React.useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 500 });
    formTranslate.value = withTiming(0, { duration: 500 });
  }, []);

  const formEntranceStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslate.value }],
  }));

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const set = (key: keyof FormState) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const slideToNext = () => {
    slideX.value = withSequence(
      withTiming(-20, { duration: 150 }),
      withTiming(0, { duration: 250 })
    );
  };

  const validateStep = (): boolean => {
    let errs: FormErrors = {};
    if (step === 0) {
      if (!form.displayName.trim()) errs.displayName = "Display name is required";
      else if (form.displayName.trim().length < 2) errs.displayName = "At least 2 characters";
      if (!form.username.trim()) errs.username = "Username is required";
      else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
        errs.username = "3–20 chars, letters/numbers/underscore only";
    } else {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Enter a valid email";
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "At least 8 characters";
      else if (!/[A-Z]/.test(form.password)) errs.password = "Need one uppercase letter";
      else if (!/[0-9]/.test(form.password)) errs.password = "Need one number";
      if (form.confirmPassword !== form.password)
        errs.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setErrors({});
    slideToNext();
    setStep(1);
  };

  const handleBack = () => {
    setErrors({});
    slideToNext();
    setStep(0);
  };

  const handleRegister = async () => {
 console.log("Registering with form data:", form); // Debugging line
  if (!validateStep()) return;

  setErrors({});

  setIsLoading(true);

  try {

    const response =
      await AuthService.register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        number: form.number,
      });
      
     console.log("Registration response:", response); // Debugging line
    Alert.alert(
      "Registration Successful",
      response.message ||
      "Verification email sent. Please verify your email before login.",
      [
        {
          text: "OK",
          onPress: () =>
            router.replace(
              "/(auth)/emailVerification",
            ),
        },
      ]
    );
    router.replace("/(auth)/emailVerification");

  } catch (error: any) {
  console.log(
    "REGISTER ERROR:",
    error.response?.data
  );

  console.log(
    "STATUS:",
    error.response?.status
  );

  Alert.alert(
    "Error",
    error.response?.data?.message ||
    "Registration failed"
  );
} finally {

    setIsLoading(false);

  }
};

  return (
    <SafeAreaView style={r.root}>
      <View style={r.orb1} />
      <View style={r.orb2} />

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={r.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={r.backBtn}
            onPress={step === 0 ? () => router.back() : handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={r.backText}>← Back</Text>
          </TouchableOpacity>

          <Animated.View style={[r.content, formEntranceStyle]}>
            {/* Logo */}
            <View style={r.logoMark}>
              <LinearGradient
                colors={[COLORS.indigo.dark, COLORS.indigo.primary]}
                style={r.logoGradient}
              >
                <Text style={r.logoText}>E</Text>
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={r.header}>
              <Text style={r.title}>
                {step === 0 ? "Create account" : "Almost there"}
              </Text>
              <Text style={r.subtitle}>
                {step === 0
                  ? "Join Era Chat — it only takes a minute."
                  : "Set up your login credentials."}
              </Text>
            </View>

            {/* Step indicator */}
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {/* Form */}
            <Animated.View style={[shakeStyle, slideStyle]}>
              {step === 0 ? (
                <View>
                  <Field
                    label="Display Name"
                    value={form.displayName}
                    onChangeText={set("displayName")}
                    placeholder="How should Era call you?"
                    error={errors.displayName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                  <Field
                    label="Username"
                    value={form.username}
                    onChangeText={set("username")}
                    placeholder="your_username"
                    error={errors.username}
                    hint="Letters, numbers, and underscores only"
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                  />

                  {/* Avatar placeholder teaser */}
                  <View style={r.avatarTeaser}>
                    <View style={r.avatarCircle}>
                      <Text style={r.avatarInitial}>
                        {form.displayName?.[0]?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={r.avatarTitle}>Profile photo</Text>
                      <Text style={r.avatarSub}>
                        You can add a photo after signing up
                      </Text>
                    </View>
                    <View style={r.avatarBadge}>
                      <Text style={{ fontSize: 11, color: COLORS.indigo.light }}>Later</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <Field
                    label="Email address"
                    value={form.email}
                    onChangeText={set("email")}
                    placeholder="you@example.com"
                    error={errors.email}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                  <Field 
                   label="Phone Number"
                   onChangeText={set("number")}
                   value={form.number}
                   placeholder="Enter your phone number"
                    error={errors.number}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                  <Field
                    label="Password"
                    value={form.password}
                    onChangeText={set("password")}
                    placeholder="Min. 8 chars, one uppercase, one number"
                    error={errors.password}
                    secureTextEntry
                    returnKeyType="next"
                    showStrength
                  />
                  <Field
                    label="Confirm Password"
                    value={form.confirmPassword}
                    onChangeText={set("confirmPassword")}
                    placeholder="Repeat your password"
                    error={errors.confirmPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />

                  {/* Terms */}
                  <Text style={r.terms}>
                    By creating an account you agree to our{" "}
                    <Text style={r.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={r.termsLink}>Privacy Policy</Text>.
                  </Text>
                </View>
              )}

              {/* CTA */}
              <Animated.View style={[{ marginTop: 8 }, btnStyle]}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 15 }); }}
                  onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
                  onPress={step === 0 ? handleNext : handleRegister}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? ["#3730A3", "#3730A3"]
                        : [COLORS.indigo.dark, COLORS.indigo.primary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={r.submitBtn}
                  >
                    {isLoading ? (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <LoadingDot index={0} />
                        <LoadingDot index={1} />
                        <LoadingDot index={2} />
                      </View>
                    ) : (
                      <Text style={r.submitText}>
                        {step === 0 ? "Continue →" : "Create Account ✦"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Footer */}
            <View style={r.footer}>
              <Text style={r.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={r.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const r = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.1)",
    top: -100,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139,92,246,0.08)",
    bottom: 80,
    right: -60,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    paddingTop: 12,
    paddingBottom: 8,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    color: COLORS.indigo.light,
    fontWeight: "500",
  },
  content: { flex: 1, paddingTop: 12 },
  logoMark: { marginBottom: 24, alignSelf: "flex-start" },
  logoGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 26, fontWeight: "700", color: "#fff" },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.muted,
    lineHeight: 22,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: COLORS.text.muted },
  footerLink: {
    fontSize: 14,
    color: COLORS.indigo.light,
    fontWeight: "600",
  },
  avatarTeaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
    marginTop: 4,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.indigo.muted,
    borderWidth: 2,
    borderColor: "rgba(99,102,241,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.indigo.light,
  },
  avatarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  avatarSub: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  avatarBadge: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  terms: {
    fontSize: 12,
    color: COLORS.text.disabled,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 4,
  },
  termsLink: {
    color: COLORS.indigo.light,
    fontWeight: "500",
  },
});