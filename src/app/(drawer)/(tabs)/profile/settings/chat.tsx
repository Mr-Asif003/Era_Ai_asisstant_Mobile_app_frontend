import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Edit3, Link, Download, Volume2, Camera, Info, Trash2, Zap,
} from "lucide-react-native";
import { C, SubHeader, SectionHeader, Card, SettingRow } from "../_shared";

export default function ChatSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    enterToSend: true, autoDownload: false, linkPreview: true,
    mediaAutoPlay: false, saveToGallery: false, showTimestamps: true,
  });
  const toggle = (k: keyof typeof settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg0 }} edges={["top"]}>
      <SubHeader title="Chat Settings" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <SectionHeader title="Compose" icon={<Edit3 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Zap size={18} color="#fff" strokeWidth={2} />} iconBg="#6366F1"
            label="Enter to Send" toggle toggleValue={settings.enterToSend} onToggle={() => toggle("enterToSend")} />
          <SettingRow icon={<Link size={18} color="#fff" strokeWidth={2} />} iconBg="#0EA5E9"
            label="Link Previews" toggle toggleValue={settings.linkPreview} onToggle={() => toggle("linkPreview")} last />
        </Card>

        <SectionHeader title="Media" icon={<Download size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Download size={18} color="#fff" strokeWidth={2} />} iconBg="#10B981"
            label="Auto-Download Media" toggle toggleValue={settings.autoDownload} onToggle={() => toggle("autoDownload")} />
          <SettingRow icon={<Volume2 size={18} color="#fff" strokeWidth={2} />} iconBg="#F59E0B"
            label="Auto-Play Videos" toggle toggleValue={settings.mediaAutoPlay} onToggle={() => toggle("mediaAutoPlay")} />
          <SettingRow icon={<Camera size={18} color="#fff" strokeWidth={2} />} iconBg="#EC4899"
            label="Save to Gallery" toggle toggleValue={settings.saveToGallery} onToggle={() => toggle("saveToGallery")} last />
        </Card>

        <SectionHeader title="Display" icon={<Info size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Info size={18} color="#fff" strokeWidth={2} />} iconBg="#7C3AED"
            label="Show Timestamps" toggle toggleValue={settings.showTimestamps} onToggle={() => toggle("showTimestamps")} last />
        </Card>

        <SectionHeader title="Storage" icon={<Trash2 size={12} color={C.dim} strokeWidth={2} />} />
        <Card>
          <SettingRow icon={<Trash2 size={18} color="#fff" strokeWidth={2} />} iconBg={C.red}
            label="Clear Chat Cache" danger
            onPress={() => Alert.alert("Clear Cache", "This will free up storage space. Your messages won't be deleted.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => {} },
            ])} last />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}