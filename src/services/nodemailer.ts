import nodemailer from "nodemailer";
import { ADMIN_ID, ADMIN_PASS_KEY } from "../constants.js";

export const transportClient = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ADMIN_ID,
    pass: ADMIN_PASS_KEY,
  },
  connectionTimeout: 10000,
  pool: true,
});

transportClient.verify((error, success) => {
  if (error) {
    console.error("SMTP error:", error);
  } else {
    console.log("SMTP server is ready!");
  }
});
