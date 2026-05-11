import type { Request, Response } from "express";
import Restaurant, { type MenuItemtype } from "../models/restaurant.js";
import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";
import Order from "../models/order.js";
import { inngest } from "../inngest/index.js";

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
    couponAmount: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
    country: string;
    contact: string;
  };
  restaurantId: string;
};

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId,
    );

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems,
    );

    const subtotal = lineItems.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
      const discounted = itemTotal - itemTotal * item.couponAmount;

      return acc + discounted;
    }, 0);

    const total = subtotal + restaurant.deliveryPrice;

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "pending",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      totalAmount: total,
      createdAt: new Date(),
      restaurantName: restaurant.restaurantName,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), //paise
      currency: "INR",
      receipt: `${newOrder._id}_rcpt`,
    });

    await newOrder.save();

    res.status(200).json({
      orderId: razorpayOrder.id,
      orderDbId: newOrder._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      lineItems,
      total,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message:
        error?.error?.description || error?.message || "Something went wrong",
    });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemtype[],
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString(),
    );

    if (!menuItem) {
      throw new Error(`Menu Item not found: ${cartItem.menuItemId}`);
    }

    return {
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: Number(cartItem.quantity),
      price: menuItem.price,
      couponAmount: cartItem.couponAmount,
    };
  });

  return lineItems;
};

const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDbId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    const order = await Order.findById(orderDbId);

    if (!order) {
      return res
        .status(404)
        .json({ message: `Order not found with ID ${orderDbId}` });
    }

    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: `Order Payment is already done for this orderId:${orderDbId}`,
      });
    }

    order.status = "paid";
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // send email to user on successful payment
    inngest
      .send({
        name: "payment/success",
        data: {
          deliveryDetails: order.deliveryDetails,
          id: order._id,
          status: order.status,
          createdAt: order.createdAt,
          restaurantName: order.restaurantName,
          totalAmount: order.totalAmount,
        },
      })
      .catch((error) => {
        console.error(`[INNGEST_ERROR] in payment success mailer:${error}`);
      });

    res.status(200).json({ success: true, message: "Payment successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in verification payment",
    });
  }
};

const validateFailure = async (req: Request, res: Response) => {
  try {
    const { orderDbId } = req.body;

    if (!orderDbId) {
      return res
        .status(400)
        .json({ message: "Missing OrderDbId", success: false });
    }

    const order = await Order.findById(orderDbId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with Id:${orderDbId} not found!`,
      });
    }

    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Order already paid, cannot mark failed",
      });
    }

    if (order.status === "failed") {
      return res.status(200).json({
        success: true,
        message: "Order already marked as failed",
      });
    }

    order.status = "failed";
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update payment status" });
  }
};

export default {
  createCheckoutSession,
  verifyPayment,
  validateFailure,
  getMyOrders,
};
