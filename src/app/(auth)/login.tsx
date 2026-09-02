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
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/lib/constants";
// import index from "../(tabs)/chats/index";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "../../stores/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "At least 6 characters";
  }
  return errors;
}

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  autoFocus?: boolean;
}

const InputField: React.FC<InputProps> = ({
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
  rightLabel,
  onRightLabelPress,
  autoFocus = false,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? "#EF4444"
      : `rgba(99,102,241,${borderAnim.value})`,
  }));

  const handleFocus = () => {
    setFocused(true);
    borderAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setFocused(false);
    borderAnim.value = withTiming(0, { duration: 200 });
  };

  return (
    <View style={inputStyles.wrap}>
      <View style={inputStyles.labelRow}>
        <Text style={inputStyles.label}>{label}</Text>
        {rightLabel && (
          <TouchableOpacity onPress={onRightLabelPress}>
            <Text style={inputStyles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.View
        style={[
          inputStyles.inputWrap,
          borderStyle,
          error ? inputStyles.inputError : null,
        ]}
      >
        <TextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          selectionColor={COLORS.indigo.primary}
          autoCorrect={false}
        />
      </Animated.View>

      {error ? (
        <Text style={inputStyles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  rightLabel: {
    fontSize: 13,
    color: COLORS.indigo.light,
    fontWeight: "500",
  },
  inputWrap: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  input: {
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: "400",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
});

// ─── Password Input with Show/Hide ────────────────────────────────────────────

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  rightLabel?: string;
  onRightLabelPress?: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  returnKeyType = "done",
  onSubmitEditing,
  rightLabel,
  onRightLabelPress,
}) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? "#EF4444"
      : `rgba(99,102,241,${borderAnim.value})`,
  }));

  return (
    <View style={inputStyles.wrap}>
      <View style={inputStyles.labelRow}>
        <Text style={inputStyles.label}>{label}</Text>
        {rightLabel && (
          <TouchableOpacity onPress={onRightLabelPress}>
            <Text style={inputStyles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.View style={[inputStyles.inputWrap, borderStyle, error ? inputStyles.inputError : null]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={[inputStyles.input, { flex: 1 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.disabled}
            secureTextEntry={!show}
            autoCapitalize="none"
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            onFocus={() => {
              setFocused(true);
              borderAnim.value = withTiming(1, { duration: 200 });
            }}
            onBlur={() => {
              setFocused(false);
              borderAnim.value = withTiming(0, { duration: 200 });
            }}
            selectionColor={COLORS.indigo.primary}
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShow((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 13, color: COLORS.indigo.light, fontWeight: "500" }}>
              {show ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const shakeX = useSharedValue(0);
  const btnScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formTranslate = useSharedValue(24);

  // Entrance animation
  React.useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 500 });
    formTranslate.value = withTiming(0, { duration: 500 });
  }, []);

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslate.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const setAuth =
  useAuthStore(
    (state) => state.setAuth
  );



const handleLogin = async () => {
  const validationErrors = validate(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    triggerShake();
    return;
  }

  try {
    setIsLoading(true);

    const response = await AuthService.login({
      email: form.email.trim(),
      password: form.password,
    });

    console.log("Login Response:", response);

    await setAuth(response.user, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    console.log(
      "Stored Token:",
      useAuthStore.getState().accessToken
    );

    Alert.alert("Success", "Login Successful");

    router.replace("/(drawer)/(tabs)");
  } catch (error: any) {
    console.log("LOGIN ERROR:", error);

    Alert.alert(
      "Login Failed",
      error?.response?.data?.message || "Login failed"
    );

    triggerShake();
  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={s.root}>
      {/* Background orb */}
      <View style={s.orb1} />
      <View style={s.orb2} />

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <Animated.View style={[s.content, formStyle]}>
            {/* Logo mark */}
            <View style={s.logoMark}>
              <LinearGradient
                colors={[COLORS.indigo.dark, COLORS.indigo.primary]}
                style={s.logoGradient}
              >
                <Text style={s.logoText}>E</Text>
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={s.header}>
              <Text style={s.title}>Welcome back</Text>
              <Text style={s.subtitle}>Sign in to continue to Era Chat</Text>
            </View>

            {/* Form */}
            <Animated.View style={[s.form, shakeStyle]}>
              <InputField
                label="Email address"
                value={form.email}
                onChangeText={(t) => {
                  setForm((f) => ({ ...f, email: t }));
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                placeholder="you@example.com"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                autoFocus
              />

              <PasswordInput
                label="Password"
                value={form.password}
                onChangeText={(t) => {
                  setForm((f) => ({ ...f, password: t }));
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                placeholder="Enter your password"
                error={errors.password}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                rightLabel="Forgot?"
                onRightLabelPress={() => Alert.alert("Reset Password", "Coming soon!")}
              />

              {/* Submit */}
              <Animated.View style={btnStyle}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => { btnScale.value = withSpring(0.97, { damping: 15 }); }}
                  onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
                  onPress={handleLogin}
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
                    style={s.submitBtn}
                  >
                    {isLoading ? (
                      <View style={s.loadingRow}>
                        <LoadingDots />
                      </View>
                    ) : (
                      <Text style={s.submitText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Social placeholder */}
              <TouchableOpacity onPress={() => { Alert.alert("Continue with Google", "Coming soon!"); }} style={s.socialBtn}>
                <Text style={s.socialIcon}>G</Text>
                <Text style={s.socialText}>Continue with Google</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <View style={s.footer}>
              <Text style={s.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={s.footerLink}>Sign up free</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Loading Dots ─────────────────────────────────────────────────────────────

const LoadingDot: React.FC<{ index: number }> = ({ index }) => {
  const scale = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.6, { duration: 300 })
      ),
      -1,
      false
    );
  }, []);

  // need to import withRepeat/withSequence at top — already imported
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

const LoadingDots: React.FC = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <LoadingDot index={0} />
    <LoadingDot index={1} />
    <LoadingDot index={2} />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

import { withRepeat } from "react-native-reanimated";

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  orb1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(99,102,241,0.12)",
    top: -80,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139,92,246,0.08)",
    bottom: 100,
    left: -60,
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
  content: {
    flex: 1,
    paddingTop: 12,
  },
  logoMark: {
    marginBottom: 28,
    alignSelf: "flex-start",
  },
  logoGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  header: {
    marginBottom: 32,
  },
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
  form: {
    width: "100%",
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.text.disabled,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.bg.tertiary,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  socialText: {
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.indigo.light,
    fontWeight: "600",
  },
});