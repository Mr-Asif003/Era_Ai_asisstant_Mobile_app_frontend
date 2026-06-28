import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  Mail,
  ArrowRight,
} from "lucide-react-native";
import { Link } from "expo-router";

export default function EmailVerificationScreen() {
  return (
    <View className="flex-1 bg-black px-6 items-center justify-center">

      {/* Card */}
      <View className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 items-center border border-zinc-800">

        {/* Icon */}
        <View className="h-20 w-20 rounded-full bg-blue-500/20 items-center justify-center mb-6">
          <Mail
            size={40}
            color="#3B82F6"
          />
        </View>

        {/* Logo */}
        <Text className="text-3xl font-bold text-white mb-2">
          ERA ✨
        </Text>

        {/* Title */}
        <Text className="text-xl font-semibold text-white text-center">
          Verify Your Email
        </Text>

        {/* Description */}
        <Text className="text-zinc-400 text-center mt-3 leading-6">
          We've sent a verification link to your email
          address.
        </Text>

        <Text className="text-zinc-400 text-center mt-1 leading-6">
          Please check your Inbox or Spam folder and
          click the verification link to activate your
          account.
        </Text>

        {/* Login Button */}
        <Link
          href="/(auth)/login"
          asChild
        >
          <TouchableOpacity className="w-full bg-primary-400  rounded-xl py-4 mt-8 flex-row items-center justify-center">
            <Text className="text-white font-semibold text-base mr-2">
              Go To Login
            </Text>

            <ArrowRight
              size={18}
              color="white"
            />
          </TouchableOpacity>
        </Link>

        {/* Resend Button (Future Use) */}
        <TouchableOpacity
          className="mt-4"
          activeOpacity={0.7}
        >
          <Text className="text-blue-400 font-medium">
            Resend Verification Email
          </Text>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <Text className="text-zinc-500 text-center text-sm mt-8">
        Didn't receive the email?
        {"\n"}
        Check your spam folder or try again.
      </Text>

    </View>
  );
}