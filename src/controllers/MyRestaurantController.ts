import type { Request, Response } from "express";
import User from "../models/user.js";
import Restaurant from "../models/restaurant.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurantName } = req.body;

    const user = await User.findOne({ user: req.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.restaurants.length > 5) {
      return res
        .status(403)
        .json({
          message: "Owner can only have 5 restaurants at max",
          code: "RESTAURANT_LIMIT_EXCEEDED",
        });
    }

    const restaurant = await Restaurant.findOne({
      restaurantName: restaurantName,
      user: req.userId,
    });

    if (restaurant) {
      return res
        .status(400)
        .json({ message: "Restaurant with the same name already exists" });
    }

    const coverImage = req.file as Express.Multer.File;
    const base64Image = Buffer.from(coverImage.buffer).toString("base64");
    const dataURI = `data${coverImage.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI);
    const newRestaurant = new Restaurant(req.body);

    newRestaurant.imageUrl = uploadResponse.url;

    newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
    await newRestaurant.save();

    res.status(201).send(newRestaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  createMyRestaurant,
};
