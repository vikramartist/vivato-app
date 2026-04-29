import type { Request, Response } from "express";
import User from "../models/user.js";
import Restaurant from "../models/restaurant.js";
import mongoose from "mongoose";
import { MAX_ADDRESS_UPDATES, MAX_RESTAURANT_COUNT } from "../constants.js";
import { getCoords } from "../services/getCoords.js";

const getMyRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({ user: req.userId }).sort({
      createdAt: -1,
      lastUpdated: -1,
      updatedAt: -1,
    });

    if (!restaurants) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    res.status(200).json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get the restaurants" });
  }
};

const getMyRestaurantById = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get the restaurant" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const {
      restaurantName,
      address,
      city,
      country,
      zipCode,
      openingTime,
      closingTime,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.restaurants.length > MAX_RESTAURANT_COUNT) {
      return res.status(403).json({
        message: `Owner can only have ${MAX_RESTAURANT_COUNT} restaurants at max`,
        code: "RESTAURANT_LIMIT_EXCEEDED",
      });
    }

    const restaurant = await Restaurant.findOne({
      restaurantName: restaurantName.trim(),
      user: req.userId,
    });

    if (restaurant) {
      return res
        .status(400)
        .json({ message: "Restaurant with the same name already exists" });
    }

    const newRestaurant = new Restaurant(req.body);

    newRestaurant.lastUpdated = new Date();

    newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
    const coordinates = await getCoords(
      `${address}, ${city}, ${country}, ${zipCode}`,
    );
    newRestaurant.location = {
      type: "Point",
      coordinates,
    };

    newRestaurant.addressUpdateCounter += 1;

    //update isOpen logic

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    let isOpen;

    if (openingTime < closingTime) {
      isOpen = minutes >= openingTime && minutes < closingTime;
    } else {
      isOpen = minutes >= openingTime || minutes < closingTime;
    }

    newRestaurant.isOpen = isOpen;

    await newRestaurant.save();

    await User.findByIdAndUpdate(
      user._id,
      {
        $addToSet: { restaurants: newRestaurant._id },
      },
      { new: true },
    );
    res.status(201).send(newRestaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { address, city, country, zipCode } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    const isAddressChanged =
      restaurant.address !== address ||
      restaurant.city !== city ||
      restaurant.country !== country ||
      restaurant.zipCode !== zipCode;

    if (
      isAddressChanged &&
      restaurant.addressUpdateCounter >= MAX_ADDRESS_UPDATES
    ) {
      return res.status(400).json({
        message: `Address limit reached!. Address, city, country and zipCode can only be updated ${MAX_ADDRESS_UPDATES} times.`,
      });
    }
    if (isAddressChanged) {
      const coordinates = await getCoords(
        `${address}, ${city}, ${country}, ${zipCode}`,
      );
      restaurant.location = {
        type: "Point",
        coordinates,
      };

      restaurant.addressUpdateCounter += 1;
    }

    ((restaurant.restaurantName = req.body.restaurantName),
      (restaurant.restaurantType = req.body.restaurantType),
      (restaurant.description = req.body.description),
      (restaurant.imageUrl = req.body.imageUrl),
      (restaurant.contact = req.body.contact),
      (restaurant.address = req.body.address),
      (restaurant.country = req.body.country),
      (restaurant.city = req.body.city),
      (restaurant.zipCode = req.body.zipCode),
      (restaurant.deliveryPrice = req.body.deliveryPrice),
      (restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime),
      (restaurant.cuisines = req.body.cuisines),
      (restaurant.openingTime = req.body.openingTime),
      (restaurant.closingTime = req.body.closingTime),
      (restaurant.menuItems = req.body.menuItems),
      (restaurant.lastUpdated = new Date()),
      await restaurant.save());
    res.status(200).json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  createMyRestaurant,
  getMyRestaurants,
  updateMyRestaurant,
  getMyRestaurantById,
};
