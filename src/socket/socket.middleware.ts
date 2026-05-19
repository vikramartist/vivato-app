import type { NextFunction } from "express";
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth.authToken;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.decode(token) as jwt.JwtPayload;

    const auth0Id = decoded.sub as string;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return next(new Error("User not found"));
    }

    if (user.role !== "Rider") {
      return next(new Error("Unauthorized access"));
    }

    socket.data.userId = user._id.toString();
    socket.data.auth0Id = auth0Id;

    next();
  } catch (error) {
    console.log(error);
    next(new Error("Unauthorized"));
  }
};
