// types/conversation.types.ts
export type ConversationType = "DIRECT" | "GROUP";

export interface ConversationMember {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: "MEMBER" | "ADMIN";
}

export interface LastMessage {
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  members: ConversationMember[];
  lastMessage: LastMessage | null;
  createdAt: string;
  updatedAt: string;
}