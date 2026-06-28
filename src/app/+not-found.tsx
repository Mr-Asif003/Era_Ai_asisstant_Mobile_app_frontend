import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { COLORS } from "@/lib/constants";

export default function NotFound() {
  return (
    <View style={s.root}>
      <Text style={s.title}>Screen not found</Text>
      <Link href="/(auth)" style={s.link}>Go to home</Link>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg.primary, alignItems: "center", justifyContent: "center", gap: 16 },
  title: { fontSize: 18, color: COLORS.text.primary },
  link: { fontSize: 15, color: COLORS.indigo.light },
});