import type { Request, Response } from "express";
import Restaurant, { type MenuItemtype } from "../models/restaurant.js";
import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";
import Order from "../models/order.js";

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
  };
  restaurantId: string;
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

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems,
    );

    const total = lineItems.reduce((total, item) => {
      const price = total + item.price * item.quantity;
      return price - price * item.couponAmount;
    }, 0);

    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, //paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      shipping_fee: restaurant.deliveryPrice * 100,
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
    res.status(500).json({ message: error.raw.message });
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

    if (order?.status === "paid") {
      return res.status(200).json({
        success: true,
        message: `Order Payment is already done for this orderId:${orderDbId}`,
      });
    }

    await Order.findByIdAndUpdate(orderDbId, {
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    res.status(201).json({ success: true, message: "Payment successfull" });
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

export default { createCheckoutSession, verifyPayment, validateFailure };
