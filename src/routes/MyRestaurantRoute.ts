import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController.js";
import { jwtCheck, jwtParse, validateUserRole } from "../middleware/auth.js";
import { validateMYRestaurantRequest } from "../middleware/validation.js";

const router = express.Router();

// [GET] /api/my/restaurant

router.get(
  "/",
  jwtCheck,
  jwtParse,
  validateUserRole,
  MyRestaurantController.getMyRestaurants,
);

router.get(
  "/orders",
  jwtCheck,
  jwtParse,
  validateUserRole,
  MyRestaurantController.getMyRestaurantOrders,
);

router.patch(
  "/:restaurantId/orders/:orderId/status",
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateOrderStatus,
);
// [POST] /api/my/restaurant
router.post(
  "/",
  jwtCheck,
  jwtParse,
  validateMYRestaurantRequest,
  validateUserRole,
  MyRestaurantController.createMyRestaurant,
);

router.get(
  "/:restaurantId",
  jwtCheck,
  jwtParse,
  validateUserRole,
  MyRestaurantController.getMyRestaurantById,
);

router.put(
  "/:restaurantId",
  jwtCheck,
  jwtParse,
  validateMYRestaurantRequest,
  validateUserRole,
  MyRestaurantController.updateMyRestaurant,
);

export default router;
