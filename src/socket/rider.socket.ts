import type { Socket } from "socket.io";
import User from "../models/user.js";

export const registerRiderHandlers = (socket: Socket) => {
  socket.on("rider-online", async () => {
    await User.findByIdAndUpdate(socket.data.userId, {
      socketId: socket.id,
      "riderInfo.isAvailable": true,
      "riderInfo.lastActiveAt": new Date(),
    });
  });

  socket.on("heartbeat", async () => {
    await User.findByIdAndUpdate(socket.data.userId, {
      "riderInfo.lastActiveAt": new Date(),
    });
  });

  socket.on("rider-offline", async (callback) => {
    await User.findByIdAndUpdate(socket.data.userId, {
      "riderInfo.isAvailable": false,
      "riderInfo.lastActiveAt": new Date(),
    });

    callback();
  });

  socket.on("disconnect", async () => {
    console.log("Disconnected");
  });
};
