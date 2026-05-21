import type { Request, Response } from "express";
import User from "../models/user.js";
import Restaurant, { type RestaurantDetails } from "../models/restaurant.js";
import mongoose from "mongoose";
import { MAX_ADDRESS_UPDATES, MAX_RESTAURANT_COUNT } from "../constants.js";
import { getCoords } from "../services/getCoords.js";
import Order, { type OrderDetails } from "../models/order.js";
import { isRiderEligible } from "../utils/rider.js";
import { io } from "../index.js";
import { inngest } from "../inngest/index.js";

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

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find({ user: req.userId }).select(
      "_id",
    );

    if (!restaurants) {
      return res.status(404).json({
        message: `Restaurants not found for the userid:${req.userId}`,
      });
    }

    const restaurantIds = restaurants.map((r) => r._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .populate("restaurant")
      .populate("user")
      .sort({ createdAt: -1 });

    const groupedMap = new Map();

    orders.forEach((order) => {
      const restaurantId = order.restaurant?._id.toString();

      if (!groupedMap.has(restaurantId)) {
        groupedMap.set(restaurantId, {
          restaurant: order.restaurant,
          orders: [],
          status: order.status,
        });
      }

      groupedMap.get(restaurantId).orders.push(order);
    });

    const groupedOrders = Array.from(groupedMap.values());

    res.status(200).json(groupedOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
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

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    if (order.restaurant?.toString() !== restaurantId) {
      return res.status(400).json({
        message: "Order does not belong to this restaurant",
      });
    }

    order.status = status;
    order.updatedAt = new Date();

    if (status === "delivered") {
      const riderDetails = await User.findByIdAndUpdate(
        order.assignedRider,
        {
          "riderInfo.status": "Online",
          $inc: { "riderInfo.totalDeliveries": 1 },
          $set: { "riderInfo.lastActiveAt": new Date() },
        },
        { new: true },
      );

      order.deliveredAt = new Date();

      inngest
        .send({
          name: "delivery/success",
          data: {
            deliveryDetails: order.deliveryDetails,
            id: order._id,
            status,
            createdAt: order.createdAt,
            restaurantName: order.restaurantName,
            totalAmount: order.totalAmount,
            riderDetails: {
              name: riderDetails?.name,
              email: riderDetails?.email,
              contact: riderDetails?.contact,
              riderId: riderDetails?.riderInfo?.riderId,
              vehicleType: riderDetails?.riderInfo?.vehicleType,
              vehicleNumber: riderDetails?.riderInfo?.vehicleNumber,
              deliveredAt: order.deliveredAt,
            },
          },
        })
        .catch((error) => {
          console.error(`[INNGEST_ERROR] in deliivery success mailer:${error}`);
        });
    }

    await order.save();

    if (status === "readyForPickup") {
      const eligibleRiders = await handleOrderStatusChange(
        restaurant._id.toString(),
      );

      if (!eligibleRiders?.length) {
        return res.status(400).json({
          message: "No eligible riders found!",
        });
      }

      eligibleRiders.forEach((rider) => {
        console.log("sending to rider", rider.socketId);
        if (rider.socketId) {
          io.to(rider.socketId).emit("updated-order", order);
        }
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const handleOrderStatusChange = async (restaurantId?: string) => {
  const riders = await User.find({
    role: "Rider",
    "riderInfo.isAvailable": true,
  });

  if (!riders || riders.length === 0) {
    return null;
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return null;
  }

  const eligibleRiders = riders.filter((rider) => {
    return isRiderEligible(rider, restaurant);
  });

  return eligibleRiders;
};

export default {
  createMyRestaurant,
  getMyRestaurants,
  updateMyRestaurant,
  getMyRestaurantById,
  getMyRestaurantOrders,
  updateOrderStatus,
};
