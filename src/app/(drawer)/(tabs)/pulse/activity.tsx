import React, { useState } from "react";
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft, Activity, MessageSquare, Bell,
  Clock, CheckSquare, AtSign, Sparkles, Star,
  Volume2, Users, TrendingUp,
} from "lucide-react-native";

const C = {
  bg0:"#0B0E1A",bg1:"#111827",bg2:"#1a2235",bg3:"#252D3D",
  indigo:"#6366F1",indigoD:"#4F46E5",indigoL:"#818CF8",
  text:"#F1F5F9",muted:"#94A3B8",dim:"#64748B",
  border:"rgba(255,255,255,0.06)",green:"#22C55E",
  amber:"#F59E0B",red:"#EF4444",pink:"#F472B6",violet:"#A78BFA",
};

type ActivityType = "message"|"reaction"|"mention"|"reminder"|"task"|"era"|"voice"|"group";

interface ActivityItem {
  id:     string;
  type:   ActivityType;
  title:  string;
  body:   string;
  time:   string;
  color:  [string,string];
}

const TYPE_ICONS: Record<ActivityType, React.FC<any>> = {
  message:  MessageSquare,
  reaction: Star,
  mention:  AtSign,
  reminder: Clock,
  task:     CheckSquare,
  era:      Sparkles,
  voice:    Volume2,
  group:    Users,
};

const SECTIONS = [
  {
    title: "Today",
    data: [
      { id:"a01", type:"era"      as ActivityType, title:"Era Morning Digest", body:"12 messages, 2 reminders, 3 tasks summarised.", time:"8:00 AM",  color:["#DB2777","#A78BFA"] as [string,string] },
      { id:"a02", type:"reminder" as ActivityType, title:"Reminder: Call Jordan", body:"Scheduled for 3:00 PM today.", time:"8:01 AM",  color:[C.amber,"#F97316"] as [string,string] },
      { id:"a03", type:"mention"  as ActivityType, title:"Alex mentioned you", body:"In Design Team: @you can you review the new components?", time:"9:12 AM",  color:[C.indigo,C.indigoL] as [string,string] },
      { id:"a04", type:"message"  as ActivityType, title:"New message from Alex", body:"Heard you! Sending the file now 📎", time:"9:15 AM",  color:[C.indigoD,C.indigo] as [string,string] },
      { id:"a05", type:"task"     as ActivityType, title:"Task Due Soon", body:"Review Figma handoff — due 5:00 PM", time:"10:00 AM", color:[C.green,"#059669"] as [string,string] },
      { id:"a06", type:"reaction" as ActivityType, title:"Maya reacted 🔥", body:"To your message \"Yeah it looks amazing!\"", time:"11:30 AM", color:["#F59E0B","#EF4444"] as [string,string] },
      { id:"a07", type:"voice"    as ActivityType, title:"Voice note from Jordan", body:"24-second voice message received", time:"2:15 PM",  color:["#F59E0B","#EF4444"] as [string,string] },
      { id:"a08", type:"era"      as ActivityType, title:"Era Nudge", body:"Haven't replied to Sam in 2 days — draft a follow-up?", time:"4:00 PM",  color:["#DB2777",C.violet] as [string,string] },
    ],
  },
  {
    title: "Yesterday",
    data: [
      { id:"a09", type:"group"   as ActivityType, title:"Project Alpha update", body:"Priya: Deployment is live ✅",         time:"9:00 AM",  color:["#0EA5E9",C.indigo] as [string,string] },
      { id:"a10", type:"task"    as ActivityType, title:"Task completed", body:"\"Send project summary to Sam\" marked done", time:"10:30 AM", color:[C.green,"#059669"] as [string,string] },
      { id:"a11", type:"message" as ActivityType, title:"Sam Rivera", body:"See you at the standup!",                       time:"2:00 PM",  color:[C.indigoD,C.indigo] as [string,string] },
      { id:"a12", type:"reminder"as ActivityType, title:"Reminder completed", body:"Weekly team standup done",               time:"3:00 PM",  color:[C.amber,"#F97316"] as [string,string] },
    ],
  },
  {
    title: "Monday",
    data: [
      { id:"a13", type:"era"     as ActivityType, title:"Era Weekly Summary", body:"47 messages, 5 tasks, 3 reminders this week", time:"8:00 AM",  color:["#DB2777",C.violet] as [string,string] },
      { id:"a14", type:"mention" as ActivityType, title:"Sam mentioned you",   body:"In Work Chat: @you we need your sign-off",   time:"11:00 AM", color:[C.indigo,C.indigoL] as [string,string] },
    ],
  },
];

const ActivityRow: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const Icon = TYPE_ICONS[item.type] || Bell;
  return (
    <View style={ar.wrap}>
      {/* Timeline dot + line */}
      <View style={ar.timeline}>
        <LinearGradient colors={item.color} style={ar.dot} />
        <View style={ar.line} />
      </View>
      {/* Icon + content */}
      <View style={ar.iconWrap}>
        <LinearGradient colors={item.color} style={ar.iconGrad}>
          <Icon size={14} color="#fff" strokeWidth={2} />
        </LinearGradient>
      </View>
      <View style={ar.content}>
        <View style={ar.topRow}>
          <Text style={ar.title} numberOfLines={1}>{item.title}</Text>
          <Text style={ar.time}>{item.time}</Text>
        </View>
        <Text style={ar.body} numberOfLines={2}>{item.body}</Text>
      </View>
    </View>
  );
};

const ar = StyleSheet.create({
  wrap: { flexDirection:"row", paddingHorizontal:16, paddingVertical:10, gap:12, alignItems:"flex-start" },
  timeline: { width:16, alignItems:"center", paddingTop:4 },
  dot: { width:10, height:10, borderRadius:5, flexShrink:0 },
  line: { flex:1, width:1, backgroundColor:C.border, marginTop:4 },
  iconWrap: { flexShrink:0, marginTop:-2 },
  iconGrad: { width:34, height:34, borderRadius:11, alignItems:"center", justifyContent:"center" },
  content: { flex:1, paddingTop:2, gap:4 },
  topRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  title: { fontSize:14, fontWeight:"600", color:C.text, flex:1, marginRight:8 },
  time: { fontSize:11, color:C.dim },
  body: { fontSize:13, color:C.muted, lineHeight:19 },
});

// ─── Stats banner ──────────────────────────────────────────────────────────────
const StatsBanner: React.FC = () => (
  <View style={sb.wrap}>
    {[
      { label:"Messages",  value:"47",  color:C.indigo },
      { label:"Tasks done",value:"5",   color:C.green  },
      { label:"Reminders", value:"8",   color:C.amber  },
      { label:"Mentions",  value:"4",   color:C.pink   },
    ].map((s) => (
      <View key={s.label} style={sb.item}>
        <Text style={[sb.value, { color:s.color }]}>{s.value}</Text>
        <Text style={sb.label}>{s.label}</Text>
      </View>
    ))}
  </View>
);

const sb = StyleSheet.create({
  wrap: {
    flexDirection:"row", margin:16,
    backgroundColor:C.bg1, borderRadius:18,
    borderWidth:1, borderColor:C.border, overflow:"hidden",
  },
  item: { flex:1, alignItems:"center", paddingVertical:14, gap:4 },
  value: { fontSize:20, fontWeight:"700" },
  label: { fontSize:10, color:C.dim, fontWeight:"600" },
});

export default function ActivityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg0 }} edges={["top"]}>
      {/* Header */}
      <View style={ah.header}>
        <TouchableOpacity onPress={() => router.back()} style={ah.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={ah.title}>Activity Log</Text>
        <View style={ah.iconBtn}>
          <TrendingUp size={16} color={C.indigoL} strokeWidth={2} />
        </View>
      </View>

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow item={item} />}
        renderSectionHeader={({ section }) => (
          <View style={ah.sectionHead}>
            <Text style={ah.sectionTitle}>{section.title}</Text>
            <View style={ah.sectionLine} />
          </View>
        )}
        ListHeaderComponent={<StatsBanner />}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const ah = StyleSheet.create({
  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:16, paddingVertical:14,
    borderBottomWidth:1, borderBottomColor:C.border,
  },
  back: { width:36, height:36, alignItems:"center", justifyContent:"center" },
  title: { fontSize:17, fontWeight:"700", color:C.text },
  iconBtn: {
    width:36, height:36, borderRadius:10,
    backgroundColor:C.bg2, borderWidth:1, borderColor:C.border,
    alignItems:"center", justifyContent:"center",
  },
  sectionHead: {
    flexDirection:"row", alignItems:"center", gap:12,
    paddingHorizontal:16, paddingTop:16, paddingBottom:8,
  },
  sectionTitle: { fontSize:12, fontWeight:"700", color:C.dim, letterSpacing:0.8, textTransform:"uppercase" },
  sectionLine: { flex:1, height:1, backgroundColor:C.border },
});