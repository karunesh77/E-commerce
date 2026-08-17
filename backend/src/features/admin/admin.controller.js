import User from "../auth/auth.model.js";
import Product from "../products/product.model.js";
import Order from "../orders/order.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Revenue calculation
  const orders = await Order.find({ status: "delivered" });
  const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "email name")
    .select("_id pricing.total status createdAt");

  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentOrders,
  };

  res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});

// ─── GET ALL USERS (ADMIN) ─────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("-password -refreshToken")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully"
    )
  );
});

// ─── UPDATE USER ROLE (ADMIN) ──────────────────────────────────────────────
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User role updated successfully"));
});

// ─── DELETE USER (ADMIN) ───────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

// ─── GET SALES REPORT ──────────────────────────────────────────────────────
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = { status: "delivered" };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const salesData = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSales: { $sum: "$pricing.total" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, salesData, "Sales report fetched successfully"));
});

// ─── GET TOP PRODUCTS ──────────────────────────────────────────────────────
export const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topProducts = await Product.find()
    .sort({ numReviews: -1 })
    .limit(Number(limit))
    .select("name price numReviews ratings");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        topProducts,
        "Top products fetched successfully"
      )
    );
});

// ─── GET INVENTORY STATUS ──────────────────────────────────────────────────
export const getInventoryStatus = asyncHandler(async (req, res) => {
  const lowStockLimit = req.query.limit || 10;

  const lowStockProducts = await Product.find({
    stock: { $lt: lowStockLimit },
  }).select("name stock price category");

  const outOfStockProducts = await Product.find({
    stock: 0,
  }).select("name category price");

  const totalStockValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
        totalItems: { $sum: "$stock" },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        lowStockProducts,
        outOfStockProducts,
        totalStockValue: totalStockValue[0] || { totalValue: 0, totalItems: 0 },
      },
      "Inventory status fetched successfully"
    )
  );
});
