import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Eye, Type, Contrast, Captions, MousePointer, Volume2,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow, OptionRow } from "../_shared";

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    reduceMotion: false,
    highContrast: false,
    boldText: false,
    screenReaderHints: true,
    captionsOnVoice: false,
    largerTouchTargets: false,
  });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Accessibility" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Vision" icon={<Eye size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Contrast size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="High Contrast Mode" toggle toggleValue={settings.highContrast} onToggle={() => toggle("highContrast")} />
          <SettingRow icon={<Type size={18} color="#fff" strokeWidth={2} />} iconBg="#8B5CF6"
            label="Bold Text" toggle toggleValue={settings.boldText} onToggle={() => toggle("boldText")} />
          <SettingRow icon={<MousePointer size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Larger Touch Targets" toggle toggleValue={settings.largerTouchTargets} onToggle={() => toggle("largerTouchTargets")} last />
        </Card>

        <SectionHeader title="Motion" icon={<MousePointer size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<MousePointer size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Reduce Motion" toggle toggleValue={settings.reduceMotion} onToggle={() => toggle("reduceMotion")} last />
        </Card>

        <SectionHeader title="Audio & Captions" icon={<Volume2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Captions size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Captions on Voice Notes" toggle toggleValue={settings.captionsOnVoice} onToggle={() => toggle("captionsOnVoice")} />
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#DB2777"
            label="Screen Reader Hints" toggle toggleValue={settings.screenReaderHints} onToggle={() => toggle("screenReaderHints")} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}