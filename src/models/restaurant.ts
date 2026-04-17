import mongoose, { Schema } from "mongoose";

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    menuImageUrl: [{ type: String, required: true }],
    calories: { type: Number },
  },
  { timestamps: true },
);

const restaurantSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantName: { type: String, required: true, trim: true },
    description: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    contact: { type: String, required: true },
    zipCode: { type: String },
    coordinates: [{ lat: { type: String }, lng: { type: String } }],
    deliveryPrice: { type: Number, required: true },
    estimatedDeliveryTime: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    cuisines: [{ type: String, required: true }],
    menuItems: [menuItemSchema],
    lastUpdated: { type: Date, required: true },
    isOpen: { type: Boolean, default: true },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
