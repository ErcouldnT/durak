import { io } from "socket.io-client";

const socketUrl =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:3000"
    : "wss://durak.erkut.dev";

export const socket = io(socketUrl, {
  transports: ["websocket"],
  autoConnect: false,
  // reconnectionAttempts: 5,
  // reconnectionDelay: 1000,
  // reconnectionDelayMax: 5000,
  // timeout: 20000,
});
