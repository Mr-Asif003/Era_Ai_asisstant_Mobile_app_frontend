import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";

export default function Index() {
 // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthenticated = false;
  
  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to chats...");
    return <Redirect href="/(drawer)/(tabs)/chats" />;
  }
  return <Redirect href="/(auth)" />;
}