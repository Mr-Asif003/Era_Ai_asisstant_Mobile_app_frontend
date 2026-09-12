import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { useAuthStore } from "@/stores/auth.store";

const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  "http://localhost:8080/api/ws";

let stompClient: Client | null = null;
let connectPromise: Promise<void> | null = null;

function getClient(): Client {
  if (stompClient) {
    return stompClient;
  }

  console.log("🔧 Creating STOMP client");
  console.log("🌐 SockJS URL:", WS_BASE_URL);

  const client = new Client({
    webSocketFactory: () => {
      console.log("🔌 Creating SockJS connection...");
      return new SockJS(WS_BASE_URL);
    },

    reconnectDelay: 4000,

    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    debug: (message) => {
      console.log("[STOMP]", message);
    },
  });

  client.onWebSocketOpen = () => {
    console.log("🟢 WebSocket OPEN");
  };

  client.onWebSocketClose = (event) => {
    console.log("🔴 WebSocket CLOSED", event);
    connectPromise = null;
  };

  client.onWebSocketError = (event) => {
    console.error("❌ WebSocket ERROR:", event);
  };

  client.onStompError = (frame) => {
    console.error("❌ STOMP ERROR");
    console.error("Headers:", frame.headers);
    console.error("Body:", frame.body);

    connectPromise = null;
  };

  client.onDisconnect = () => {
    console.log("🔌 STOMP DISCONNECTED");
    connectPromise = null;
  };

  stompClient = client;

  return client;
}

/**
 * Connect STOMP and WAIT until the STOMP CONNECT frame
 * has been successfully received.
 */
export function connectSocket(): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  console.log("================================");
  console.log("🔌 CONNECT SOCKET");
  console.log("Token exists:", !!token);
  console.log("================================");

  if (!token) {
    return Promise.reject(
      new Error("No authentication token available")
    );
  }

  const client = getClient();

  // Already connected
  if (client.connected) {
    console.log("✅ STOMP already connected");
    return Promise.resolve();
  }

  // Connection already in progress
  if (connectPromise) {
    console.log("⏳ STOMP connection already in progress");
    return connectPromise;
  }

  connectPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    client.connectHeaders = {
      Authorization: `Bearer ${token}`,
    };

    client.onConnect = (frame) => {
      console.log("================================");
      console.log("🟢 STOMP CONNECTED");
      console.log("Session:", frame.headers["session"]);
      console.log("client.connected:", client.connected);
      console.log("================================");

      if (!client.connected) {
        console.error(
          "❌ onConnect fired but client.connected is false"
        );
        return;
      }

      if (!settled) {
        settled = true;
        connectPromise = null;
        resolve();
      }
    };

    client.onStompError = (frame) => {
      console.error("================================");
      console.error("❌ STOMP CONNECTION ERROR");
      console.error("Message:", frame.headers["message"]);
      console.error("Body:", frame.body);
      console.error("================================");

      if (!settled) {
        settled = true;
        connectPromise = null;

        reject(
          new Error(
            frame.headers["message"] ||
              frame.body ||
              "STOMP connection failed"
          )
        );
      }
    };

    console.log("🚀 Activating STOMP client...");

    if (!client.active) {
      client.activate();
    } else {
      console.log("⏳ STOMP client already active");
    }
  });

  return connectPromise;
}

/**
 * Check whether STOMP is actually connected.
 */
export function isSocketConnected(): boolean {
  const connected = !!stompClient?.connected;

  console.log("🔎 STOMP connected:", connected);

  return connected;
}

/**
 * Get connected STOMP client.
 *
 * IMPORTANT:
 * Never subscribe before connectSocket() resolves.
 */
function getConnectedClient(): Client {
  const client = getClient();

  if (!client.connected) {
    throw new Error(
      "STOMP is not connected. Call await connectSocket() before subscribing."
    );
  }

  return client;
}

/**
 * Subscribe to incoming direct messages.
 */
export function subscribeToMessages(
  onMessage: (payload: any) => void
): () => void {
  const client = getConnectedClient();

  console.log(
    "📡 SUBSCRIBE → /user/queue/messages"
  );

  const subscription: StompSubscription =
    client.subscribe(
      "/user/queue/messages",
      (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);

          console.log(
            "📨 MESSAGE RECEIVED:",
            payload
          );

          onMessage(payload);
        } catch (error) {
          console.error(
            "❌ Failed to parse message:",
            error
          );
        }
      }
    );

  return () => {
    console.log(
      "🧹 UNSUBSCRIBE → /user/queue/messages"
    );

    subscription.unsubscribe();
  };
}

/**
 * Subscribe to delivery receipts.
 */
export function subscribeToDelivery(
  onReceipt: (payload: any) => void
): () => void {
  const client = getConnectedClient();

  console.log(
    "📡 SUBSCRIBE → /user/queue/delivery"
  );

  const subscription =
    client.subscribe(
      "/user/queue/delivery",
      (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);

          console.log(
            "📬 DELIVERY RECEIPT:",
            payload
          );

          onReceipt(payload);
        } catch (error) {
          console.error(
            "❌ Failed to parse delivery receipt:",
            error
          );
        }
      }
    );

  return () => {
    console.log(
      "🧹 UNSUBSCRIBE → /user/queue/delivery"
    );

    subscription.unsubscribe();
  };
}

/**
 * Subscribe to typing events.
 */
export function subscribeToTyping(
  onTyping: (payload: any) => void
): () => void {
  const client = getConnectedClient();

  console.log(
    "📡 SUBSCRIBE → /user/queue/typing"
  );

  const subscription =
    client.subscribe(
      "/user/queue/typing",
      (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);

          console.log(
            "⌨️ TYPING EVENT:",
            payload
          );

          onTyping(payload);
        } catch (error) {
          console.error(
            "❌ Failed to parse typing event:",
            error
          );
        }
      }
    );

  return () => {
    console.log(
      "🧹 UNSUBSCRIBE → /user/queue/typing"
    );

    subscription.unsubscribe();
  };
}

/**
 * Disconnect STOMP.
 *
 * IMPORTANT:
 * Do NOT call this from ChatScreen cleanup.
 * Use this for logout/app shutdown.
 */
export async function disconnectSocket(): Promise<void> {
  const client = stompClient;

  if (!client) {
    console.log("ℹ️ No STOMP client");
    return;
  }

  console.log("🔌 Disconnecting STOMP...");

  try {
    await client.deactivate();
  } catch (error) {
    console.error(
      "❌ STOMP disconnect error:",
      error
    );
  }

  stompClient = null;
  connectPromise = null;

  console.log("✅ STOMP disconnected");
}