import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantName: { type: String, required: true },
    deliveryDetails: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      contact: { type: String, required: true },
    },
    cartItems: [
      {
        menuItemId: { type: String, required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: [
        "paid",
        "failed",
        "pending",
        "confirmed",
        "preparing",
        "readyForPickup",
        "pickedUp",
        "delivered",
        "cancelled",
      ],
    },
    assignedAt: { type: Date },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now() },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
