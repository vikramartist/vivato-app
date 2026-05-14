import { type Request, type Response } from "express";
import User from "../models/user.js";
import { ADMIN_ID } from "../constants.js";
import { generateRiderId } from "../utils/rider.js";

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

export default {
  getCurrentUser,
  createCurrentUser,
  updateCurrentUser,
  updateUserRiderProfile,
  getRiderProfile,
};
