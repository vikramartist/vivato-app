import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.js";
import { generateRouteKey, routeCache } from "../services/cache.js";
import { CACHE_DURATION } from "../constants.js";

const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find();

    res.status(200).json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const searchNearbyRestaurants = async (req: Request, res: Response) => {
  try {
    const { lat, lng, distance } = req.query;

    const maxDistance = distance ? Number(distance) : 10000;

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: maxDistance,
        },
      },
    ]);

    res.status(200).json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city as string;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedFoodType = (req.query.foodType as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    const query: any = {};

    query["city"] = new RegExp(city, "i");

    const cityCheck = await Restaurant.countDocuments(query);

    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));

      query["cuisines"] = { $all: cuisinesArray };
    }

    if (selectedFoodType) {
      query["menuItems.foodType"] = selectedFoodType;
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();
    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getRestaurantRoute = async (req: Request, res: Response) => {
  try {
    const { source, target } = req.body;

    if (!source || !target) {
      return res.status(400).json({ message: "Missing coordinates" });
    }

    const key = generateRouteKey(
      { lat: Number(source?.lat), lng: Number(source?.lng) },
      { lat: Number(target?.lat), lng: Number(target?.lng) },
    );

    const cachedRoute = routeCache.get(key);

    //cache
    if (cachedRoute) {
      const isExpired = Date.now() - cachedRoute.timestamp > CACHE_DURATION;

      if (!isExpired) {
        console.log("Cached has key: ", key);
        return res.json(cachedRoute.data);
      }

      routeCache.delete(key);
    }

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.ORS_API_KEY as string,
        },
        body: JSON.stringify({
          coordinates: [
            [Number(source?.lng), Number(source?.lat)],
            [Number(target?.lng), Number(target?.lat)],
          ],
          geometry: true,
          format: "geojson",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.features?.length) {
      return res
        .status(500)
        .json({ message: "Failed to fetch route", orsError: data });
    }

    const route = data.features[0];

    const result = {
      distance: route.properties.summary.distance,
      duration: route.properties.summary.duration,
      geometry: route.geometry,
    };

    routeCache.set(key, { data: result, timestamp: Date.now() });

    res.status(200).json(result);
  } catch (error) {
    console.log("Route API error:", error);
    res.status(500).json({ message: "Route error" });
  }
};

export default {
  searchRestaurants,
  getRestaurantById,
  getAllRestaurants,
  searchNearbyRestaurants,
  getRestaurantRoute,
};
