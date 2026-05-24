import express from "express";
import AiController from "../controllers/AiController.js";
import { jwtCheck, jwtParse } from "../middleware/auth.js";

const router = express.Router();

router.post("/food-search", jwtCheck, jwtParse, AiController.aiFoodSearch);

export default router;
