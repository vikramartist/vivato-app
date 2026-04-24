import mongoose from "mongoose";
import { Schema } from "mongoose";

const roleRequestSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestedRole: { type: String, required: true },
    currentRole: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
    },
    reason: { type: String, required: true },
    comments: { type: String },
    userFeedback: { type: String },
    address: { type: String },
    documents: { type: Boolean, required: true },
  },
  { timestamps: true },
);

const RoleRequest = mongoose.model("RoleRequest", roleRequestSchema);

export default RoleRequest;
