import express, { Router } from "express";
import MyUserController from "../controllers/MyUserController.js";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import { validateMyUserRequest } from "../middleware/validation.js";

const router: Router = express.Router();

router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
// [POST] /api/my/user
router.post("/", jwtCheck, MyUserController.createCurrentUser);

router.put(
  "/",
  jwtCheck,
  jwtParse,
  validateMyUserRequest,
  MyUserController.updateCurrentUser,
);

export default router;
