import nodemailer from "nodemailer";
import { BREVO_SMTP_PASSWORD, BREVO_SMTP_USER } from "../constants.js";

export const transportClient = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_PASSWORD,
  },
  connectionTimeout: 60000,
  pool: true,
  greetingTimeout: 60000,
  socketTimeout: 60000,
});
