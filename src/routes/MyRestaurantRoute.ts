import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController.js";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

// [POST] /api/my/restaurant
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "menuImages", maxCount: 5 },
  ]),
  jwtCheck,
  jwtParse,

  MyRestaurantController.createMyRestaurant,
);

export default router;
