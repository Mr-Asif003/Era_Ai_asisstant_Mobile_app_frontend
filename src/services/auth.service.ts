import api from "../backend/api/client";
import { ENDPOINTS } from "../backend/api/endpoints";

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth.types";

import type { ApiResponse } from "@/types/api.types";

export class AuthService {
  static async login(
    payload: LoginRequest
  ): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      payload
    );

    // Return only the actual auth data
    return res.data.data;
  }

  static async register(payload: RegisterRequest) {
    const res = await api.post(
      ENDPOINTS.AUTH.REGISTER,
      payload
    );

    return res.data;
  }

  static async logout(refreshToken: string) {
    const res = await api.post(
      ENDPOINTS.AUTH.LOGOUT,
      {
        refreshToken,
      }
    );

    return res.data;
  }
}