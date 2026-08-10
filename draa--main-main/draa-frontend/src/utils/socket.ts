import { io, Socket } from "socket.io-client";

// Use the main backend URL (same server that runs Express + Socket.io)
// In dev this is the Vite proxy target; in prod it's the API domain
const SOCKET_URL =
  import.meta.env.PROD
    ? "https://api.draa.in"
    : "http://127.0.0.1:5000";

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  // Allow polling fallback so corporate firewalls / mobile networks don't block us
  transports: ["websocket", "polling"],
  // Reconnection config
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default socket;
