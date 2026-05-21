import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoutes.js";
import myRestaurantRoute from "./routes/MyRestaurantRoute.js";
import myUserRoleRequest from "./routes/MyUserRoleRequest.js";
import restaurantRoute from "./routes/Restaurant.js";
import orderRoute from "./routes/OrderRoute.js";
import { serve } from "inngest/express";
import { functions, inngest } from "./inngest/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket/socket.js";
import { markInactiveRidersOffline } from "./utils/rider.js";

mongoose.connect(process.env.MONGO_CONNECTION_STRING as string).then(() => {
  console.log("Connected to database!");
});

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CALLBACK_URL,
    credentials: true,
  },
});

setupSocket(io);

app.use(express.json());
app.use(cors());
app.use("/api/inngest", serve({ client: inngest, functions: functions }));

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/role-requests", myUserRoleRequest);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/v1/order", orderRoute);

//cleanup inactive users
setInterval(async () => {
  await markInactiveRidersOffline();
}, 60000);

httpServer.listen(8000, () => {
  console.log("App running on port 8000");
});
