import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import MyUserRoleRequestController from "../controllers/MyUserRoleRequestController.js";
import { validateMyRoleRequest } from "../middleware/validation.js";

const router = express.Router();

// [GET] api/my/role-requests
router.get("/", jwtCheck, jwtParse, MyUserRoleRequestController.getRoleRequest);

// [GET] api/role-requests/requests
router.get(
  "/requests",
  jwtCheck,
  jwtParse,
  MyUserRoleRequestController.getAllRoleRequests,
);

// [POST] api/my/role-requests
router.post(
  "/",
  jwtCheck,
  jwtParse,
  validateMyRoleRequest,
  MyUserRoleRequestController.createRoleRequest,
);

export default router;
