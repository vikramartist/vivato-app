import express, { Router } from "express";
import MyUserController from "../controllers/MyUserController.js";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
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
  validateMyRiderUserProfileRequest,
  MyUserController.updateUserRiderProfile,
);

export default router;
