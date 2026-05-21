import mongoose, { Schema, type InferSchemaType } from "mongoose";

const menuItemSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    menuImageUrl: [{ type: String, required: true }],
    calories: { type: Number },
    foodType: { type: String, enum: ["veg", "non-veg"] },
  },
  { timestamps: true },
);

export type MenuItemtype = InferSchemaType<typeof menuItemSchema>;

const restaurantSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantName: { type: String, required: true, trim: true },
    restaurantType: {
      type: String,
      enum: ["veg", "non-veg", "mixed"],
      required: true,
    },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true, index: 1 },
    country: { type: String, required: true },
    contact: { type: String, required: true },
    zipCode: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    deliveryPrice: { type: Number, required: true },
    estimatedDeliveryTime: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    cuisines: [{ type: String, required: true }],
    menuItems: [menuItemSchema],
    lastUpdated: { type: Date, required: true },
    isOpen: { type: Boolean, required: true },
    openingTime: { type: Number, required: true },
    closingTime: { type: Number, required: true },
    rating: {
      type: Number,
      default: 0,
    },
    addressUpdateCounter: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.index({
  restaurantType: 1,
  city: 1,
  rating: -1,
});
restaurantSchema.index({ user: 1 });
restaurantSchema.index({ openingTime: 1, closingTime: 1 });
restaurantSchema.index({ restaurantType: 1, city: 1 });
restaurantSchema.index({
  restaurantName: "text",
  cuisines: "text",
});

export type RestaurantDetails = InferSchemaType<typeof restaurantSchema>;

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
