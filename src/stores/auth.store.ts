import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/storage";
import type { User, AuthTokens } from "../types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: User, tokens: AuthTokens) => Promise<void>;
  updateTokens: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (user, tokens) => {
    await Promise.all([
      storage.set(STORAGE_KEYS.USER, user),
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);

    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: !!(user && tokens.accessToken),
    });
  },

  updateTokens: async (tokens) => {
    await Promise.all([
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);

    set((state) => ({
      ...state,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: !!(state.user && tokens.accessToken),
    }));
  },

  logout: async () => {
    await Promise.all([
      storage.remove(STORAGE_KEYS.USER),
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  hydrate: async () => {
    const [user, accessToken, refreshToken] = await Promise.all([
      storage.get<User>(STORAGE_KEYS.USER),
      storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
      storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!(user && accessToken),
      isHydrated: true,
    });
  },
}));

export const getAccessToken = () =>
  useAuthStore.getState().accessToken;

export const getRefreshToken = () =>
  useAuthStore.getState().refreshToken;

export const getUser = () =>
  useAuthStore.getState().user;