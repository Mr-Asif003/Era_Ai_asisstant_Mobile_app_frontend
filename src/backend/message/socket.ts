import { Client, IMessage } from "@stomp/stompjs";
import { useAuthStore } from "@/stores/auth.store";

const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? "ws://localhost:8080/api/ws/websocket";

let stompClient: Client | null = null;

function getClient(): Client {
  if (!stompClient) {
    stompClient = new Client({
      brokerURL: WS_BASE_URL,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log("[stomp raw]", msg), // TEMP: see everything
    });
  }
  return stompClient;
}

export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) { reject(new Error("No token")); return; }

    const client = getClient();

    if (client.connected) { resolve(); return; }

    client.connectHeaders = { Authorization: `Bearer ${token}` };
    client.onConnect = () => resolve();
    client.onStompError = (frame) => reject(new Error(frame.headers["message"]));
    client.onWebSocketClose = (e) => console.log("[socket] WS closed", e?.code, e?.reason);

    if (!client.active) client.activate();
  });
}

export function subscribeToMessages(onMessage: (payload: any) => void) {
  const client = getClient();
  console.log("[socket] subscribeToMessages called, client.connected =", client.connected);
  const sub = client.subscribe("/user/queue/messages", (msg: IMessage) => {
    console.log("[socket] STOMP frame arrived on /user/queue/messages:", msg.body);
    onMessage(JSON.parse(msg.body));
  });
  console.log("[socket] subscription created, id =", sub.id);
  return () => sub.unsubscribe();
}

export function subscribeToDelivery(onReceipt: (payload: any) => void) {
  const client = getClient();
  const sub = client.subscribe("/user/queue/delivery", (msg: IMessage) => onReceipt(JSON.parse(msg.body)));
  return () => sub.unsubscribe();
}

export function disconnectSocket() {
  stompClient?.deactivate();
  stompClient = null;
}