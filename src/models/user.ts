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
      enum: ["Customer", "Owner", "Rider", "Admin"],
      default: "Customer",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    riderInfo: {
      type: new Schema({
        isAvailable: {
          type: Boolean,
          default: false,
        },
        riderId: { type: String, unique: true, sparse: true },
        experience: { type: Number, default: 0 },
        vehicleNumber: {
          type: String,
          required: function () {
            return this.role === "Rider";
          },
        },
        drivingLicenseNumber: {
          type: String,
          required: function () {
            return this.role === "Rider";
          },
        },
        vehicleType: {
          type: String,
          enum: ["Bike", "Scooter", "EV-Bike", "EV-Scooter"],
        },
        currentLocation: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            default: [0, 0],
          },
        },
        deliveryRadiusKm: { type: Number, default: 10 },
        totalDeliveries: {
          type: Number,
          default: 0,
        },
        workHours: {
          start: { type: String },
          end: { type: String },
        },
        workingDays: [
          {
            type: String,
            enum: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
          },
        ],
        lastLocationUpdatedAt: { type: Date },
        averageRating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },
        lastActiveAt: { type: Date },
        totalEarnings: {
          type: Number,
          default: 0,
        },
        activeOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ["Offline", "Online", "Busy", "Leave"],
          default: "Offline",
        },
      }),
      default: undefined,
    },
  },
  { timestamps: true },
);
userSchema.index({ "riderInfo.currentLocation": "2dsphere" });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ restaurants: -1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, email: 1 });
userSchema.index({ contact: 1 });

const User = mongoose.model("User", userSchema);
export default User;
