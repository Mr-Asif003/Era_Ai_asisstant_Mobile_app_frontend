// lib/api.ts

import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:8080/api/";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;