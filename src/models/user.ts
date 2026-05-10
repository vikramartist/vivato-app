import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    auth0Id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    contact: {
      type: String,
    },
    profile_pic: {
      type: String,
    },
    addressLine1: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    role: {
      type: String,
      enum: ["Customer", "Owner", "Admin"],
      default: "Customer",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true },
);
userSchema.index({ location: "2dsphere" });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ restaurants: -1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, email: 1 });
userSchema.index({ contact: 1 });

const User = mongoose.model("User", userSchema);
export default User;
