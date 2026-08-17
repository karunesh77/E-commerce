import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  placeOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "./order.validation.js";
import {
  validateAndBuildItems,
  calculatePricing,
  deductStock,
  restoreStock,
  clearUserCart,
} from "./order.service.js";

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
// Payment ke baad call hota hai — razorpay verify controller se
// Direct yahan call nahi hoga — payment.controller se call karega
export const createOrder = async ({ userId, shippingAddress, paymentMethod, razorpayOrderId }) => {
  // Cart laao
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Products validate karo, order items banao
  const orderItems = await validateAndBuildItems(cart.items);

  // Pricing calculate karo
  const pricing = calculatePricing(orderItems);

  // Order banao
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    pricing,
    payment: {
      method: paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "paid",
      razorpayOrderId: razorpayOrderId || null,
      paidAt: paymentMethod === "razorpay" ? new Date() : null,
    },
    status: "confirmed",
    statusTimeline: [
      {
        status: "confirmed",
        message: "Order placed successfully",
        timestamp: new Date(),
      },
    ],
  });

  // Stock deduct karo
  await deductStock(orderItems);

  // Cart clear karo
  await clearUserCart(userId);

  return order;
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-statusTimeline"), // list mein timeline ki zarurat nahi
    Order.countDocuments({ user: req.user._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    }, "Orders fetched successfully")
  );
});

// ─── GET ORDER BY ID ──────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) throw new ApiError(404, "Order not found");

  // Sirf apna order dekh sake, admin sab dekhe
  if (
    req.user.role !== "admin" &&
    String(order.user._id) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You are not authorized to view this order");
  }

  return res.status(200).json(
    new ApiResponse(200, order, "Order fetched successfully")
  );
});

// ─── CANCEL ORDER (User) ──────────────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const { error, value } = cancelOrderSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  // Sirf apna order cancel kar sake
  if (String(order.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized");
  }

  // Sirf pending/confirmed order cancel ho sakta hai
  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new ApiError(400, `Order cannot be cancelled — current status: ${order.status}`);
  }

  order.status       = "cancelled";
  order.cancelReason = value.reason;
  order.cancelledAt  = new Date();
  order.statusTimeline.push({
    status: "cancelled",
    message: `Cancelled by user: ${value.reason}`,
  });

  await order.save();

  // Stock wapas add karo
  await restoreStock(order.items);

  return res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully")
  );
});

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)   || 1;
  const limit  = parseInt(req.query.limit)  || 20;
  const skip   = (page - 1) * limit;
  const status = req.query.status;

  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-statusTimeline"),
    Order.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    }, "All orders fetched")
  );
});

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateOrderStatusSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  // Cancelled order ka status change nahi ho sakta
  if (order.status === "cancelled") {
    throw new ApiError(400, "Cannot update status of a cancelled order");
  }

  order.status = value.status;
  order.statusTimeline.push({
    status: value.status,
    message: value.message || `Status updated to ${value.status}`,
  });

  // Deliver ho gaya toh timestamp lagao
  if (value.status === "delivered") {
    order.deliveredAt = new Date();
    order.payment.status = "paid";
  }

  // Admin ne cancel kiya — stock restore
  if (value.status === "cancelled") {
    order.cancelledAt = new Date();
    await restoreStock(order.items);
  }

  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Order status updated")
  );
});
