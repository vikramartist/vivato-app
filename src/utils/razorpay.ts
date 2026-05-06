import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    `${process.env.RAZORPAY_KEY_ID!} or ${process.env.RAZORPAY_KEY_SECRET!} is not defined in the .env file.`,
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});
