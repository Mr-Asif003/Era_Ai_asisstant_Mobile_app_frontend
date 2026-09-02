export type MessageType = "TEXT" | "IMAGE" | "VOICE" | "FILE" | "ERA";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface BackendMessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  replyToId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  type?: MessageType;
  replyToId?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}