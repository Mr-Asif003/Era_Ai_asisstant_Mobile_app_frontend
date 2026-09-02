// services/conversation.service.ts
import api from "../api/client";
import type { Conversation } from "./conversation.types";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const conversationService = {
  getAll: async (): Promise<Conversation[]> => {
    const { data } = await api.get<ApiResponse<Conversation[]>>("/conversations");
    return data.data;
  },

  getById: async (id: string): Promise<Conversation> => {
    const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return data.data;
  },

  createDirect: async (email: string): Promise<Conversation> => {
    const { data } = await api.post<ApiResponse<Conversation>>(
      "/conversations/direct",
      { email: email.trim().toLowerCase() }
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },
};