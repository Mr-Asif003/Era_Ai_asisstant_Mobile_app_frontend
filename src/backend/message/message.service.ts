import api from "../api/client";
import { ENDPOINTS } from "@/backend/api/endpoints";
import { BackendMessageDTO, SendMessageRequest, PagedResponse } from "../message/message.types";
import { ApiResponse } from "@/types/api.types";

export const MessageService = {
  async getMessages(conversationId: string, page = 0, size = 30) {
    const res = await api.get<ApiResponse<PagedResponse<BackendMessageDTO>>>(
      ENDPOINTS.MESSAGE.GET_MESSAGES(conversationId),
      { params: { page, size } }
    );
    // backend returns newest-first; reverse for a FlatList that renders top-to-bottom
    return res.data.data.content.slice().reverse();
  },

  async sendMessage(payload: SendMessageRequest) {
    const res = await api.post<ApiResponse<BackendMessageDTO>>(ENDPOINTS.MESSAGE.SEND, payload);
    
    return res.data.data;
  },

  async markAsRead(messageId: string) {
    const res = await api.put<ApiResponse<BackendMessageDTO>>(ENDPOINTS.MESSAGE.MARK_READ(messageId));
    return res.data.data;
  },
};