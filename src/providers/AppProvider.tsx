import { useEffect } from "react";

import {
  configureApiInterceptors,
} from "../backend/api/interceptors";

import {
  useAuthStore,
} from "../stores/auth.store";

import { connectSocket, disconnectSocket } from "../backend/message/socket";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {

    configureApiInterceptors({

      getAccessToken: () =>
        useAuthStore.getState()
          .accessToken,

      getRefreshToken: () =>
        useAuthStore.getState()
          .refreshToken,

      onTokenRefreshed: (
        tokens
      ) =>
        useAuthStore
          .getState()
          .updateTokens(tokens),

      onLogout: () =>
        useAuthStore
          .getState()
          .logout(),
    });

  }, []);

  // Keep a single app-wide WebSocket connection alive for as long as the
  // user is authenticated, instead of only connecting once a chat thread
  // happens to be open. This is what lets the conversation list (and any
  // other screen) receive messages live rather than only on next reload.
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      connectSocket().catch((err) => console.log("[socket] initial connect failed:", err));
    }

    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (state.isAuthenticated && !prevState.isAuthenticated) {
        connectSocket().catch((err) => console.log("[socket] connect failed:", err));
      }
      if (!state.isAuthenticated && prevState.isAuthenticated) {
        disconnectSocket();
      }
    });

    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, []);

  return children;
}