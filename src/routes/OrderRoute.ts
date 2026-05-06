import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import OrderController from "../controllers/OrderController.js";

const router = express.Router();

router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  OrderController.createCheckoutSession,
);

router.post(
  "/checkout/verify-payment",
  jwtCheck,
  jwtParse,
  OrderController.verifyPayment,
);

router.post(
  "/checkout/mark-failed",
  jwtCheck,
  jwtParse,
  OrderController.validateFailure,
);

export default router;
