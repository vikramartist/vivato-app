import type { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];

export const validateMyRoleRequest = [
  body("documents")
    .isBoolean()
    .notEmpty()
    .withMessage("Documents must be a boolean"),
  body("requestedRole")
    .isString()
    .notEmpty()
    .withMessage("Requested Role must be a string"),
  body("currentRole")
    .isString()
    .notEmpty()
    .withMessage("Current Role must be a string")
    .optional(),
  body("comments")
    .isString()
    .notEmpty()
    .withMessage("Comments must be a string")
    .optional(),
  body("userFeedback")
    .isString()
    .notEmpty()
    .withMessage("Feedback must be a string")
    .optional(),
  body("reason").isString().notEmpty().withMessage("Reason must be a string"),
  body("address").isString().notEmpty().withMessage("Address must be a string"),
  handleValidationErrors,
];

export const validateMYRestaurantRequest = [];
