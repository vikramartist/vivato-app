if (!process.env.BREVO_SMTP_USER) {
  throw new Error("BREVO_SMTP_USER env not set properly!");
}

if (!process.env.CALLBACK_URL) {
  throw new Error("CALLBACK_URL env not set properly!");
}

if (!process.env.CC) {
  throw new Error("CC env not set properly!");
}

if (!process.env.BREVO_SMTP_PASSWORD) {
  throw new Error("ADMIN_PASS_KEY env not set properly!");
}

if (!process.env.ADMIN_ID) {
  throw new Error("ADMIN_ID env not set properly!");
}

export const ADMIN_ID = process.env.ADMIN_ID;
export const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const BREVO_SMTP_PASSWORD = process.env.BREVO_SMTP_PASSWORD;
export const CC = process.env.CC;

export const MAX_RESTAURANT_COUNT = 20;
export const MAX_ADDRESS_UPDATES = 3;
