import "react-native-gesture-handler";

import React, { useEffect } from "react";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { useAuthStore } from "@/stores/auth.store";
import { configureApiInterceptors } from "@/lib/api";
import {useBootstrap} from "@/hooks/useBootstrap";  
import AppProvider from "@/providers/AppProvider";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const {
    hydrate,
    isHydrated,
    updateTokens,
    logout,
    isAuthenticated,
  } = useAuthStore();

 

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    configureApiInterceptors({
      getAccessToken: () =>
        useAuthStore.getState().accessToken,

      getRefreshToken: () =>
        useAuthStore.getState().refreshToken,

      onTokenRefreshed: updateTokens,
      onLogout: logout,
    });
  }, [updateTokens, logout]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isHydrated]);

  if ((!fontsLoaded && !fontError) || !isHydrated) {
    return null;
  }

  return (
    <AppProvider>
    <QueryClientProvider client={queryClient}>
      <StatusBar
        style="light"
        backgroundColor="#0B0E1A"
      />

      <Slot />
    </QueryClientProvider>
    </AppProvider>
  );
}