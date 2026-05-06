import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    deliveryDetails: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    cartItems: [
      {
        menuItemId: { type: String, required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    totalAmount: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,

    status: {
      type: String,
      enum: [
        "placed",
        "paid",
        "failed",
        "pending",
        "preparing",
        "outForDelivery",
        "delivered",
      ],
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
