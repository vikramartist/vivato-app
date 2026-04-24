import nodemailer from "nodemailer";
import { ADMIN_ID, ADMIN_PASS_KEY } from "../constants.js";

export const transportClient = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_ID,
    pass: ADMIN_PASS_KEY,
  },
});
