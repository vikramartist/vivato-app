import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController.js";
import { jwtCheck, jwtParse, validateUserRole } from "../middleware/auth.js";
import { validateMYRestaurantRequest } from "../middleware/validation.js";

const router = express.Router();

// [POST] /api/my/restaurant
router.post(
  "/",
  jwtCheck,
  jwtParse,
  validateUserRole,
  validateMYRestaurantRequest,
  MyRestaurantController.createMyRestaurant,
);

export default router;
