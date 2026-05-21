import { type Request, type Response } from "express";
import User from "../models/user.js";
import { ADMIN_ID } from "../constants.js";
import { generateRiderId, isRiderEligible } from "../utils/rider.js";
import type { OrderDetails } from "../models/order.js";
import Order from "../models/order.js";
import type { RestaurantDetails } from "../models/restaurant.js";
import { io } from "../index.js";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching user!" });
  }
};

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).send();
    }

    const newUser = new User(req.body);
    newUser.role = newUser.email === ADMIN_ID ? "Admin" : "Customer";
    await newUser.save();
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating User!" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      addressLine1,
      country,
      city,
      contact,
      profile_pic,
      location,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ messaage: "User not found" });
    }

    user.name = name;
    user.addressLine1 = addressLine1;
    user.country = country;
    user.city = city;
    user.contact = contact;
    user.profile_pic = profile_pic;

    if (location) {
      user.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }

    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const updateUserRiderProfile = async (req: Request, res: Response) => {
  try {
    const {
      experience,
      vehicleNumber,
      drivingLicenseNumber,
      vehicleType,
      currentLocation,
      deliveryRadiusKm,
      workHours,
      workingDays,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let riderId = "";
    let exists = true;

    while (exists) {
      riderId = generateRiderId(user?.name as string);
      const existingUser = await User.findOne({ "riderInfo.riderId": riderId });

      exists = !!existingUser;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          "riderInfo.riderId": riderId,
          "riderInfo.experience": experience,
          "riderInfo.vehicleNumber": vehicleNumber,
          "riderInfo.drivingLicenseNumber": drivingLicenseNumber,
          "riderInfo.vehicleType": vehicleType,
          "riderInfo.currentLocation": {
            type: "Point",
            coordinates: [
              Number(currentLocation.coordinates?.lng),
              Number(currentLocation.coordinates?.lat),
            ],
          },
          "riderInfo.deliveryRadiusKm": deliveryRadiusKm,
          "riderInfo.workHours": workHours,
          "riderInfo.workingDays": workingDays,
          "riderInfo.lastLocationUpdatedAt": new Date(),
          "riderInfo.lastActiveAt": new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    await updatedUser?.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in rider profile controller!" });
  }
};

const getRiderProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.riderInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get rider" });
  }
};

const getMyRiderOrders = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    const riderUser = await User.findById(req.userId);

    if (!riderUser) {
      return res.status(404).json({ message: "Rider not found!" });
    }

    if (riderUser.riderInfo?.riderId !== riderId) {
      return res.status(404).json({ message: "Invalid Rider" });
    }

    const orders = await Order.find({
      $or: [
        {
          status: "readyForPickup",
          assignedRider: null,
        },
        {
          assignedRider: riderUser._id,
        },
      ],
    })
      .populate("user")
      .populate("restaurant");

    if (!riderUser.riderInfo?.isAvailable) {
      return res.status(200).json([]);
    }

    const filteredOrders = orders.filter((order) => {
      if (order.assignedRider?.toString() === riderUser._id.toString()) {
        return true;
      }

      return isRiderEligible(
        riderUser,
        order.restaurant as unknown as RestaurantDetails,
      );
    });

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Rider order fetch failed", error });
  }
};

const acceptRide = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const rider = await User.findById(req.userId);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found!" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, assignedRider: null, status: "readyForPickup" },
      { assignedRider: rider._id },
      { new: true },
    );

    if (!order) {
      return res.status(400).json({
        message: "Order already accepted or unavailable",
      });
    }

    io.emit("updated-order", order);

    await User.findByIdAndUpdate(
      rider._id,
      {
        "riderInfo.status": "Busy",
        "riderInfo.activeOrder": order,
      },
      { new: true },
    );

    res.status(200).json({ message: "Order accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to accept order", error });
  }
};

const rejectRide = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const rider = await User.findById(req.userId);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found!" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, assignedRider: null, status: "readyForPickup" },
      { assignedRider: null },
      { new: true },
    );

    if (!order) {
      return res.status(400).json({
        message: "Order already rejected or unavailable",
      });
    }

    io.emit("updated-order", order);

    await User.findByIdAndUpdate(
      rider._id,
      {
        "riderInfo.status": "Online",
        "riderInfo.activeOrder": null,
      },
      { new: true },
    );

    res.status(200).json({ message: "Order rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to reject order", error });
  }
};

const getRiderById = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    const rider = await User.findById(riderId);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found!" });
    }

    res.status(200).json(rider);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get rider By Id" });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
  updateCurrentUser,
  updateUserRiderProfile,
  getRiderProfile,
  getMyRiderOrders,
  acceptRide,
  rejectRide,
  getRiderById,
};
