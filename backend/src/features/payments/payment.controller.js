import crypto from "crypto";
import razorpay from "../../config/razorpay.js";
import Cart from "../cart/cart.model.js";
import Order from "../orders/order.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { validateAndBuildItems, calculatePricing } from "../orders/order.service.js";
import { createOrder } from "../orders/order.controller.js";
import { placeOrderSchema } from "../orders/order.validation.js";

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
// Step 1: Frontend yahan aata hai → Razorpay order ID milti hai
// Step 2: Frontend Razorpay checkout kholega iss ID se
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { error, value } = placeOrderSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  // Cart laao aur validate karo
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty. Add items before checkout.");
  }

  // Items validate karo — stock check + fresh price
  const orderItems = await validateAndBuildItems(cart.items);
  const pricing    = calculatePricing(orderItems);

  // Razorpay order banao (amount paise mein hota hai — multiply by 100)
  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(pricing.total * 100),
    currency: "INR",
    notes: {
      userId:  String(req.user._id),
      address: value.shippingAddress.city,
    },
  });

  // Frontend ko ye data chahiye Razorpay checkout kholne ke liye
  return res.status(200).json(
    new ApiResponse(200, {
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,  // frontend ko key chahiye
      pricing,
      shippingAddress: value.shippingAddress,
    }, "Razorpay order created")
  );
});

// ─── VERIFY PAYMENT & PLACE ORDER ─────────────────────────────────────────────
// Step 3: User ne payment ki → Razorpay ne frontend ko IDs diye
// Step 4: Frontend yahan bhejta hai → hum verify karte hain → order DB mein save
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    shippingAddress,
    paymentMethod,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Payment details incomplete");
  }

  // ── Signature Verify ──────────────────────────────────────────────────────
  // Razorpay HMAC signature verify karo — tamper protection
  // Formula: HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, secret)
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }

  // ── Order Create ───────────────────────────────────────────────────────────
  const order = await createOrder({
    userId: req.user._id,
    shippingAddress,
    paymentMethod: paymentMethod || "razorpay",
    razorpayOrderId,
  });

  // Payment IDs update karo
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  await order.save();

  return res.status(201).json(
    new ApiResponse(201, order, "Payment verified and order placed successfully")
  );
});

// ─── COD ORDER ────────────────────────────────────────────────────────────────
// Cash on delivery — payment verification ki zarurat nahi
export const placeCodOrder = asyncHandler(async (req, res) => {
  const { error, value } = placeOrderSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  if (value.paymentMethod !== "cod") {
    throw new ApiError(400, "This endpoint is only for Cash on Delivery orders");
  }

  const order = await createOrder({
    userId:          req.user._id,
    shippingAddress: value.shippingAddress,
    paymentMethod:   "cod",
  });

  return res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully (Cash on Delivery)")
  );
});

// ─── RAZORPAY WEBHOOK ─────────────────────────────────────────────────────────
// Razorpay server-to-server call karta hai — payment status update ke liye
// Ye extra safety hai — frontend bypass hone pe bhi payment record sahi rahe
export const handleWebhook = asyncHandler(async (req, res) => {
  const webhookSecret    = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers["x-razorpay-signature"];

  // Webhook signature verify karo
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const event   = req.body.event;
  const payload = req.body.payload?.payment?.entity;

  if (event === "payment.failed") {
    // Payment fail — order ko failed mark karo
    await Order.findOneAndUpdate(
      { "payment.razorpayOrderId": payload.order_id },
      {
        "payment.status": "failed",
        $push: {
          statusTimeline: {
            status: "pending",
            message: `Payment failed: ${payload.error_description || "Unknown error"}`,
          },
        },
      }
    );
  }

  // Razorpay ko 200 bhejo warna retry karta rahega
  res.status(200).json({ received: true });
});
