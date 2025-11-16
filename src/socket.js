// backend/src/socket.js
import { Server } from "socket.io";
let io;
export function initSocket(server) {
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);
    socket.on("disconnect", () => console.log("socket disconnected:", socket.id));
  });
  return io;
}
export function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
