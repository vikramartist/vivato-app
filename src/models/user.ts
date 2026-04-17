import mongoose, { model, Schema } from "mongoose";

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
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
