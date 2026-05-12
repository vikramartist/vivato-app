import type { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { isValidPhoneNumber } from "libphonenumber-js";

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
  body("contact").custom((value) => {
    if (!isValidPhoneNumber(value)) {
      throw new Error("Invalid phone number");
    }
    return true;
  }),
  body("profile_pic")
    .isString()
    .notEmpty()
    .withMessage("Profile pic is required"),
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
  body("fullAddress")
    .isString()
    .notEmpty()
    .withMessage("Address must be a string"),
  handleValidationErrors,
];

export const validateMYRestaurantRequest = [
  body("restaurantName")
    .isString()
    .notEmpty()
    .withMessage("Restaurant name is required"),
  body("restaurantType")
    .isIn(["veg", "non-veg", "mixed"])
    .notEmpty()
    .withMessage("Restaurant Type is required"),
  body("description")
    .isString()
    .notEmpty()
    .withMessage("Description name is required"),
  body("city").isString().notEmpty().withMessage("City name is required"),
  body("country").isString().notEmpty().withMessage("Country name is required"),
  body("address").isString().notEmpty().withMessage("Address name is required"),
  body("contact").isString().notEmpty().withMessage("Contact name is required"),
  body("zipCode").isString().notEmpty().withMessage("ZipCode name is required"),
  body("coordinates.type")
    .exists()
    .withMessage("Coordinates type is required")
    .equals("Point")
    .withMessage("Coordinates type must be 'Point'")
    .optional(),

  // coordinates must be an array
  body("coordinates.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be [lng, lat] array")
    .optional(),

  // longitude
  body("coordinates.coordinates.0")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180")
    .optional(),

  // latitude
  body("coordinates.coordinates.1")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90")
    .optional(),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price must be a positive number"),
  body("estimatedDeliveryTime")
    .isFloat({ min: 0 })
    .withMessage("Estimated Delivery Time must be a positive integer"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines array cannot be empty"),
  body("menuItems").isArray().withMessage("Menu Items must be an array"),
  body("menuItems.*.name")
    .isString()
    .notEmpty()
    .withMessage("MenuItems name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .notEmpty()
    .withMessage("MenuItems price is required and must be a positive number"),
  body("menuItems.*.calories")
    .isFloat({ min: 0 })
    .withMessage("MenuItems calories must be a positive number")
    .optional(),
  body("menuItems.*.foodType")
    .isIn(["veg", "non-veg"])
    .notEmpty()
    .withMessage("Menu Items foodtype is required"),
  body("menuItems.*.menuImageUrl")
    .isArray()
    .withMessage("Menu Items image url must be an array")
    .not()
    .isEmpty()
    .withMessage(
      "Menu Items Image url cannot be empty array, atleast 1 image must be there",
    ),
  body("openingTime")
    .isNumeric()
    .withMessage("Service Timings opening must be type Number")
    .not()
    .isEmpty()
    .withMessage("Service timings opening date is required"),
  body("closingTime")
    .isNumeric()
    .withMessage("Service Timings closing must be type Number")
    .not()
    .isEmpty()
    .withMessage("Service timings closing date is required"),
  handleValidationErrors,
];
