export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    VERIFY: "/auth/verify",
  },
 Conversation: {
    GET_CONVERSATIONS: "/conversations",
    GET_CONVERSATION: "/conversations/:conversationId",

    CREATE_DIRECT: "/conversations/direct",

    CREATE_GROUP: "/conversations/group",

    DELETE_CONVERSATION: "/conversations/:conversationId",
},
MESSAGE: {
    GET_MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
    SEND: "/messages",
    MARK_READ: (messageId: string) => `/messages/${messageId}/read`,
    DELETE: (messageId: string) => `/messages/${messageId}`,
  },
};  

