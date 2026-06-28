import { useEffect } from "react";

import {
  configureApiInterceptors,
} from "../backend/api/interceptors";

import {
  useAuthStore,
} from "../stores/auth.store";

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

  return children;
}