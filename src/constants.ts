if (!process.env.ADMIN_ID) {
  throw new Error("Admin_ID env not set properly!");
}

export const ADMIN_ID = process.env.ADMIN_ID;
