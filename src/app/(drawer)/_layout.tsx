import { Drawer } from "expo-router/drawer";
import EnterpriseDrawer from "@/components/EnterpriseDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <EnterpriseDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        swipeEdgeWidth: 250,
        drawerStyle: {
          backgroundColor: "#0B0E1A",
          width: 300,
        },
        drawerActiveBackgroundColor: "#6366F1",
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#94A3B8",
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: "Home" }} />
    </Drawer>
  );
}