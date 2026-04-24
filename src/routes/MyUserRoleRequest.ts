import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import MyUserRoleRequestController from "../controllers/MyUserRoleRequestController.js";
import { validateMyRoleRequest } from "../middleware/validation.js";

const router = express.Router();

// [GET] api/my/role-requests
router.get("/", jwtCheck, jwtParse, MyUserRoleRequestController.getRoleRequest);

router.get(
  "/requests/:requestId",
  jwtCheck,
  jwtParse,
  MyUserRoleRequestController.getRoleRequestById,
);

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

// [PATCH] api/my/role-requests/:requestId/approve
router.patch(
  "/:requestId/approve",
  jwtCheck,
  jwtParse,
  MyUserRoleRequestController.approveRoleRequest,
);

// [PATCH] api/my/role-requests/:requestId/reject
router.patch(
  "/:requestId/reject",
  jwtCheck,
  jwtParse,
  MyUserRoleRequestController.rejectRoleRequest,
);

export default router;
