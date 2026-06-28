import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    container: "bg-indigo-500 border border-indigo-600",
    text: "text-white",
  },
  secondary: {
    container: "bg-navy-700 border border-navy-500",
    text: "text-slate-100",
  },
  ghost: {
    container: "bg-transparent border border-navy-500",
    text: "text-slate-300",
  },
  danger: {
    container: "bg-red-500/20 border border-red-500/40",
    text: "text-red-400",
  },
};

const sizeStyles = {
  sm: { container: "px-3 py-2 rounded-xl", text: "text-sm" },
  md: { container: "px-4 py-3.5 rounded-2xl", text: "text-base" },
  lg: { container: "px-6 py-4 rounded-2xl", text: "text-lg" },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || isLoading;

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={isDisabled}
      {...props}
    >
      <View
        className={`
          flex-row items-center justify-center
          ${variantStyle.container}
          ${sizeStyle.container}
          ${fullWidth ? "w-full" : ""}
          ${isDisabled ? "opacity-50" : "opacity-100"}
        `}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#fff" : "#6366F1"}
          />
        ) : (
          <>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            <Text
              className={`font-semibold ${variantStyle.text} ${sizeStyle.text}`}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
};