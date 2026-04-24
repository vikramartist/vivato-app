import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoutes.js";
import myRestaurantRoute from "./routes/MyRestaurantRoute.js";
import myUserRoleRequest from "./routes/MyUserRoleRequest.js";

mongoose.connect(process.env.MONGO_CONNECTION_STRING as string).then(() => {
  console.log("Connected to database!");
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/role-requests", myUserRoleRequest);
app.use("/api/my/restaurant", myRestaurantRoute);

app.listen(8000, () => {
  console.log("App running on port 8000");
});
