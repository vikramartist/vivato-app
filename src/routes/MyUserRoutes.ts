import express, { Router } from "express";
import MyUserController from "../controllers/MyUserController.js";
import { jwtCheck, jwtParse, validateRiderRole } from "../middleware/auth.js";
import {
  validateMyRiderUserProfileRequest,
  validateMyUserRequest,
} from "../middleware/validation.js";

const router: Router = express.Router();

router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
router.get(
  "/rider-profile",
  jwtCheck,
  jwtParse,
  MyUserController.getRiderProfile,
);

router.get(
  "/rider/:riderId",
  jwtCheck,
  jwtParse,
  MyUserController.getRiderById,
);

router.get(
  "/rider-order/:riderId",
  jwtCheck,
  jwtParse,
  validateRiderRole,
  MyUserController.getMyRiderOrders,
);

router.patch(
  "/rider-order/:orderId/accept",
  jwtCheck,
  jwtParse,
  validateRiderRole,
  MyUserController.acceptRide,
);
router.patch(
  "/rider-order/:orderId/reject",
  jwtCheck,
  jwtParse,
  validateRiderRole,
  MyUserController.rejectRide,
);

// [POST] /api/my/user
router.post("/", jwtCheck, MyUserController.createCurrentUser);

router.put(
  "/",
  jwtCheck,
  jwtParse,
  validateMyUserRequest,
  MyUserController.updateCurrentUser,
);

router.put(
  "/update-rider",
  jwtCheck,
  jwtParse,
  validateRiderRole,
  validateMyRiderUserProfileRequest,
  MyUserController.updateUserRiderProfile,
);

export default router;
