import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { COLORS } from "@/lib/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? "border-red-500"
    : isFocused
    ? ""
    : "border-navy-500";

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-slate-300 font-medium text-sm mb-2">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center
          bg-navy-700 border rounded-2xl
          px-4 py-3.5
          ${borderColor}
        `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-slate-100 font-sans text-base"
          placeholderTextColor={COLORS.text.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={COLORS.indigo.primary}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="ml-3"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-slate-500 text-xs mt-1.5 ml-1">{hint}</Text>
      )}
    </View>
  );
};