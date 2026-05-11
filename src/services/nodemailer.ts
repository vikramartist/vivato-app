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
  connectionTimeout: 30000,
  pool: true,
  tls: {
    servername: "smtp.gmail.com",
  },
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transportClient.verify((error, success) => {
  if (error) {
    console.error("SMTP error:", error);
  } else {
    console.log("SMTP server is ready!");
  }
});
