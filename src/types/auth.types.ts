export interface User {
  id: string;

  username: string;
  email: string;
  number: string;

  displayName: string;

  bio?: string;
  avatarUrl?: string;
  avatarColor?: string;

  isOnline: boolean;
  lastSeen?: string;

  isVerified: boolean;

  createdAt: string;
  updatedAt?: string;

  eraVoice?: string;
  eraLanguage?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  number: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}