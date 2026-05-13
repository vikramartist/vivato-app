if (!process.env.CALLBACK_URL) {
  throw new Error("CALLBACK_URL env not set properly!");
}

if (!process.env.CC) {
  throw new Error("CC env not set properly!");
}

if (!process.env.ADMIN_ID) {
  throw new Error("ADMIN_ID env not set properly!");
}

export const ADMIN_ID = process.env.ADMIN_ID;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const CC = process.env.CC;

export const MAX_RESTAURANT_COUNT = 20;
export const MAX_ADDRESS_UPDATES = 3;
export const CACHE_DURATION = 1000 * 60 * 10;
