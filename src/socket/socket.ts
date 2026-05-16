import type { Server } from "socket.io";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { registerRiderHandlers } from "./rider.socket.js";

export const setupSocket = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("Socket Connected");

    registerRiderHandlers(socket);
  });
};
