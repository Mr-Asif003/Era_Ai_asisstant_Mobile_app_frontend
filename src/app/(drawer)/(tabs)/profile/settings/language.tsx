import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Globe, Clock, Calendar, Search } from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, OptionRow, SettingRow } from "../_shared";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Hindi", "Urdu",
  "Arabic", "Portuguese", "Mandarin", "Japanese",
];

const TIMEZONES = ["UTC+05:30 (India Standard Time)", "UTC+00:00 (GMT)", "UTC-05:00 (Eastern Time)"];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [dateFormat, setDateFormat] = useState<"mdy" | "dmy">("dmy");

  const filtered = LANGUAGES.filter((l) => l.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Language & Region" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="App Language" icon={<Globe size={12} color={C.dim} strokeWidth={2} />} />
        <View style={s.searchWrap}>
          <Search size={15} color={C.dim} strokeWidth={2} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search languages…"
            placeholderTextColor={C.dim}
          />
        </View>
        <Card>
          {filtered.map((lang, i) => (
            <OptionRow
              key={lang}
              label={lang}
              selected={language === lang}
              onPress={() => setLanguage(lang)}
              last={i === filtered.length - 1}
            />
          ))}
        </Card>

        <SectionHeader title="Timezone" icon={<Clock size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          {TIMEZONES.map((tz, i) => (
            <OptionRow
              key={tz}
              label={tz}
              selected={timezone === tz}
              onPress={() => setTimezone(tz)}
              last={i === TIMEZONES.length - 1}
            />
          ))}
        </Card>

        <SectionHeader title="Date Format" icon={<Calendar size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <OptionRow label="DD/MM/YYYY" selected={dateFormat === "dmy"} onPress={() => setDateFormat("dmy")} />
          <OptionRow label="MM/DD/YYYY" selected={dateFormat === "mdy"} onPress={() => setDateFormat("mdy")} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.bg2, borderRadius: 12, marginHorizontal: 16,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
});