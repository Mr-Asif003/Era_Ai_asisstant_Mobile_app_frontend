import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { AtSign, ChevronLeft, ChevronRight, MessageSquare, Users } from "lucide-react-native";

const C = {
  bg0:"#0B0E1A",bg1:"#111827",bg2:"#1a2235",
  indigo:"#6366F1",indigoD:"#4F46E5",indigoL:"#818CF8",
  text:"#F1F5F9",muted:"#94A3B8",dim:"#64748B",
  border:"rgba(255,255,255,0.06)",pink:"#F472B6",
};

const MENTIONS = [
  {
    id:"m1", sender:"Alex Chen", avatar:"A", avatarColor:["#6366F1","#8B5CF6"] as [string,string],
    context:"Hey @you, can you check the updated Figma file? I've made the changes you suggested.",
    chat:"Design Team", chatType:"group", time:"9m ago", read:false,
  },
  {
    id:"m2", sender:"Maya Patel", avatar:"M", avatarColor:["#EC4899","#F43F5E"] as [string,string],
    context:"@you what do you think about moving the deadline to Friday instead?",
    chat:"Project Alpha", chatType:"group", time:"34m ago", read:false,
  },
  {
    id:"m3", sender:"Jordan Lee", avatar:"J", avatarColor:["#F59E0B","#EF4444"] as [string,string],
    context:"I told @you about this yesterday — the new release looks great!",
    chat:"Jordan Lee", chatType:"dm", time:"2h ago", read:true,
  },
  {
    id:"m4", sender:"Sam Rivera", avatar:"S", avatarColor:["#10B981","#3B82F6"] as [string,string],
    context:"@you we need your sign-off before EOD on the proposal.",
    chat:"Work Chat", chatType:"group", time:"Yesterday", read:true,
  },
];

const MentionRow: React.FC<{
  item: typeof MENTIONS[0]; index: number; onPress: () => void;
}> = ({ item, index, onPress }) => {
  const o = useSharedValue(0);
  const y = useSharedValue(12);
  useEffect(() => {
    o.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
    y.value = withDelay(index * 60, withSpring(0, { damping: 14 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));

  const highlighted = item.context.replace(/@you/g, "|||@you|||").split("|||");

  return (
    <Animated.View style={style}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[mr.wrap, !item.read && mr.unread]}>
          {!item.read && <View style={mr.dot} />}
          <LinearGradient colors={item.avatarColor} style={mr.avatar}>
            <Text style={mr.avatarText}>{item.avatar}</Text>
          </LinearGradient>
          <View style={mr.content}>
            <View style={mr.topRow}>
              <View style={mr.senderRow}>
                <Text style={mr.sender}>{item.sender}</Text>
                <Text style={mr.divider}>·</Text>
                {item.chatType === "group"
                  ? <Users size={11} color={C.dim} strokeWidth={2} />
                  : <MessageSquare size={11} color={C.dim} strokeWidth={2} />
                }
                <Text style={mr.chatName}>{item.chat}</Text>
              </View>
              <Text style={mr.time}>{item.time}</Text>
            </View>
            <Text style={mr.context}>
              {highlighted.map((part, i) =>
                part === "@you"
                  ? <Text key={i} style={mr.mention}>@you</Text>
                  : <Text key={i}>{part}</Text>
              )}
            </Text>
          </View>
          <ChevronRight size={14} color={C.dim} strokeWidth={2} style={{ flexShrink: 0 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const mr = StyleSheet.create({
  wrap: {
    flexDirection:"row", alignItems:"flex-start",
    paddingHorizontal:16, paddingVertical:14, gap:12,
    borderBottomWidth:1, borderBottomColor:C.border, position:"relative",
  },
  unread: { backgroundColor:"rgba(99,102,241,0.04)" },
  dot: { position:"absolute", left:6, top:20, width:6, height:6, borderRadius:3, backgroundColor:C.indigo },
  avatar: { width:44, height:44, borderRadius:22, alignItems:"center", justifyContent:"center", flexShrink:0 },
  avatarText: { fontSize:16, fontWeight:"700", color:"#fff" },
  content: { flex:1, gap:5 },
  topRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  senderRow: { flexDirection:"row", alignItems:"center", gap:5 },
  sender: { fontSize:14, fontWeight:"700", color:C.text },
  divider: { fontSize:12, color:C.dim },
  chatName: { fontSize:12, color:C.muted },
  time: { fontSize:11, color:C.dim },
  context: { fontSize:13, color:C.muted, lineHeight:19 },
  mention: { color:C.indigo, fontWeight:"700" },
});

export default function MentionsScreen() {
  const router  = useRouter();
  const [items, setItems] = useState(MENTIONS);
  const unread = items.filter((i) => !i.read).length;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg0 }} edges={["top"]}>
      <View style={mh.header}>
        <TouchableOpacity onPress={() => router.back()} style={mh.back}>
          <ChevronLeft size={24} color={C.indigoL} strokeWidth={2} />
        </TouchableOpacity>
        <View style={mh.titleRow}>
          <Text style={mh.title}>Mentions</Text>
          {unread > 0 && (
            <View style={mh.badge}>
              <Text style={mh.badgeText}>{unread}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setItems((p) => p.map((i) => ({ ...i, read:true })))}>
          <Text style={mh.action}>Read all</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={mh.banner}>
        <AtSign size={14} color={C.indigo} strokeWidth={2} />
        <Text style={mh.bannerText}>
          These are all messages where someone tagged you with <Text style={{ color:C.indigo, fontWeight:"700" }}>@you</Text>.
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <MentionRow
            item={item}
            index={index}
            onPress={() => {
              setItems((p) => p.map((x) => x.id === item.id ? { ...x, read:true } : x));
              router.push("/(tabs)/chats" as any);
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems:"center", paddingTop:80, gap:12 }}>
            <AtSign size={44} color={C.dim} strokeWidth={1.5} />
            <Text style={{ fontSize:16, fontWeight:"700", color:C.text }}>No mentions yet</Text>
            <Text style={{ fontSize:13, color:C.muted, textAlign:"center", paddingHorizontal:40 }}>
              When someone tags you in a conversation, it'll show up here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const mh = StyleSheet.create({
  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:16, paddingVertical:14,
    borderBottomWidth:1, borderBottomColor:C.border,
  },
  back: { width:36, height:36, alignItems:"center", justifyContent:"center" },
  titleRow: { flexDirection:"row", alignItems:"center", gap:8 },
  title: { fontSize:17, fontWeight:"700", color:C.text },
  badge: { backgroundColor:C.indigo, borderRadius:10, paddingHorizontal:7, paddingVertical:2 },
  badgeText: { fontSize:11, fontWeight:"700", color:"#fff" },
  action: { fontSize:14, color:C.indigoL, fontWeight:"500" },
  banner: {
    flexDirection:"row", alignItems:"flex-start", gap:8,
    margin:16, backgroundColor:"rgba(99,102,241,0.08)",
    borderRadius:12, padding:12, borderWidth:1, borderColor:"rgba(99,102,241,0.15)",
  },
  bannerText: { flex:1, fontSize:13, color:C.muted, lineHeight:19 },
});