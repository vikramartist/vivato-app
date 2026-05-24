import { rateLimit } from "express-rate-limit";

export const aiRateLimiter = () => {
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: "Too many AI Requests. Please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
