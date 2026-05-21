import { OFFLINE_THRESHOLD } from "../constants.js";
import type { RestaurantDetails } from "../models/restaurant.js";
import type { UserDetails } from "../models/user.js";
import User from "../models/user.js";

export const generateRiderId = (name: string): string => {
  return `Vivato-${name.toLowerCase().replace(/\s+/g, "")}-${Math.floor(1000 * Math.random() * 9000)}`;
};

export const isRiderEligible = (
  rider: UserDetails,
  restaurant: RestaurantDetails,
) => {
  const status = rider.riderInfo?.status;

  const currentMinutes = convertToMinutes(convertDateToString(new Date()));

  const startMinutes = convertToMinutes(
    rider.riderInfo?.workHours?.start as string,
  );

  const endMinutes = convertToMinutes(
    rider.riderInfo?.workHours?.end as string,
  );

  const workingDay = rider.riderInfo?.workingDays.includes(
    getCurrentDay(new Date()) as Day,
  );

  const riderCoordinates =
    rider.riderInfo?.currentLocation?.coordinates ??
    rider.location?.coordinates;

  if (!riderCoordinates || !restaurant.location?.coordinates) {
    return false;
  }

  const workingRadius = checkDistance(
    riderCoordinates as number[],
    restaurant.location?.coordinates as number[],
  );

  const eligible =
    status === "Online" &&
    workingDay &&
    workingRadius <= rider.riderInfo?.deliveryRadiusKm! &&
    currentMinutes! >= startMinutes! &&
    currentMinutes! <= endMinutes!;

  return eligible;
};

const convertToMinutes = (time: string) => {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);

  return hour! * 60 + minute!;
};

const convertDateToString = (inputDate: Date) => {
  const hour = inputDate.getHours();
  const minute = inputDate.getMinutes();
  const formatedMinute = minute >= 10 ? minute : `0${minute}`;

  return `${hour}:${formatedMinute}`;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type Day = (typeof days)[number];

const getCurrentDay = (date: Date) => {
  return days[date.getDay()];
};

const checkDistance = (
  riderLocation: number[],
  restaurantLocation: number[],
) => {
  return getDistanceKm(
    riderLocation[1] as number,
    riderLocation[0] as number,
    restaurantLocation[1] as number,
    restaurantLocation[0] as number,
  );
};

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Earth radius in km

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
};

export const markInactiveRidersOffline = async () => {
  const threshold = new Date(Date.now() - OFFLINE_THRESHOLD);

  await User.updateMany(
    {
      role: "Rider",
      "riderInfo.isAvailable": true,
      "riderInfo.lastActiveAt": {
        $lt: threshold,
      },
    },
    {
      $set: {
        "riderInfo.isAvailable": false,
      },
    },
  );
};
