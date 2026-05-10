import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController.js";

const router = express.Router();

router.get("/", RestaurantController.getAllRestaurants);

router.get("/nearby", RestaurantController.searchNearbyRestaurants);

router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("RestaurantId parameter must be a valid string"),
  RestaurantController.getRestaurantById,
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  RestaurantController.searchRestaurants,
);

export default router;
