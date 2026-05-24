import type { Request, Response } from "express";

import Restaurant from "../models/restaurant.js";
import { getFoodsearchFilters } from "../ai/services/ai-food-search-service.js";

const commandMapper: any = {
  lte: "$lte",
  gte: "$gte",
  eq: "$eq",
};

const aiFoodSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (query.length > 200) {
      return res.status(400).json({ message: "Query too long!" });
    }

    const filters = await getFoodsearchFilters(query);

    if (!filters) {
      return res.status(400).json({ message: "AI failed to get the contents" });
    }
    const mongoQuery: any = {};

    const elemMatch: any = {};

    if (filters.cuisines.length) {
      mongoQuery["cuisines"] = {
        $in: filters.cuisines,
      };
    }

    if (filters.foodType || filters.priceFilter) {
      if (filters.foodType) {
        elemMatch.foodType = filters.foodType;
      }

      if (filters.priceFilter.operator) {
        if (filters.priceFilter.operator === "between") {
          elemMatch.price = {
            $gte: filters.priceFilter.min,
            $lte: filters.priceFilter.max,
          };
        } else {
          elemMatch.price = {
            [commandMapper[filters.priceFilter.operator]]: filters.priceFilter
              .value as number,
          };
        }
      }
    }

    mongoQuery["menuItems"] = {
      $elemMatch: elemMatch,
    };

    const foods = await Restaurant.find(mongoQuery);

    if (!foods) {
      return res.status(200).json([]);
    }

    res.status(200).json(foods);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: `AI service temporarily unavailable: ${error}` });
  }
};

export default {
  aiFoodSearch,
};
