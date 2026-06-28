export const COLORS = {
  bg: {
    primary: "#0B0E1A",
    secondary: "#111827",
    tertiary: "#1a2235",
    card: "#252D3D",
    elevated: "#2E3A4E",
  },
  indigo: {
    primary: "#6366F1",
    dark: "#4F46E5",
    light: "#818CF8",
    muted: "rgba(99,102,241,0.2)",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#CBD5E1",
    muted: "#94A3B8",
    disabled: "#64748B",
  },
  status: {
    online: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },
  border: "#2E3A4E",
} as const;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:8080/api/";


export const STORAGE_KEYS = {
  ACCESS_TOKEN: "era_access_token",
  REFRESH_TOKEN: "era_refresh_token",
  USER: "era_user",
} as const;