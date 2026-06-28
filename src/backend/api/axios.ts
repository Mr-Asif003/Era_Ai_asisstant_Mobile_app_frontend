import axios from "axios";
import { useAuthStore } from "../../"

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.1.100:8080/api"; // replace with your IP

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const authResponse = response.data.data;

        await useAuthStore.getState().updateTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        });

        originalRequest.headers.Authorization =
          `Bearer ${authResponse.accessToken}`;

        return api(originalRequest);
      } catch (e) {
        await useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);