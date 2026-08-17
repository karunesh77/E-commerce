import Coupon from "./coupon.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { validateCouponSchema } from "./coupon.validation.js";

// ─── CREATE COUPON (ADMIN) ─────────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const { error, value } = validateCouponSchema(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const existingCoupon = await Coupon.findOne({ code: value.code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, "Coupon code already exists");
  }

  const coupon = await Coupon.create(value);

  res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

// ─── GET ALL COUPONS (ADMIN) ──────────────────────────────────────────────
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const skip = (page - 1) * limit;

  const coupons = await Coupon.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Coupon.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Coupons fetched successfully"
    )
  );
});

// ─── GET COUPON DETAILS (ADMIN) ────────────────────────────────────────────
export const getCouponDetails = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId)
    .populate("applicableCategories")
    .populate("applicableProducts")
    .populate("excludedProducts");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, coupon, "Coupon details fetched"));
});

// ─── UPDATE COUPON (ADMIN) ────────────────────────────────────────────────
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { error, value } = validateCouponSchema(req.body, true);
  if (error) throw new ApiError(400, error.details[0].message);

  const coupon = await Coupon.findByIdAndUpdate(couponId, value, { new: true });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// ─── DELETE COUPON (ADMIN) ────────────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Coupon deleted successfully"));
});

// ─── VALIDATE COUPON (USER) ───────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code) throw new ApiError(400, "Coupon code is required");

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(400, "Invalid coupon code");
  }

  // Check expiry
  const now = new Date();
  if (coupon.validFrom > now || coupon.validTill < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  // Check minimum order value
  if (orderValue && orderValue < coupon.minOrderValue) {
    throw new ApiError(
      400,
      `Minimum order value of ₹${coupon.minOrderValue} required`
    );
  }

  // Check usage limit
  if (coupon.maxUsageCount && coupon.usedCount >= coupon.maxUsageCount) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  // Check per-user usage
  const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
  if (userUsage && userUsage.usedCount >= coupon.maxUsagePerUser) {
    throw new ApiError(400, "You have reached the usage limit for this coupon");
  }

  res.status(200).json(
    new ApiResponse(200, coupon, "Coupon is valid")
  );
});

// ─── APPLY COUPON (USER) ──────────────────────────────────────────────────
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code) throw new ApiError(400, "Coupon code is required");

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(400, "Invalid coupon code");
  }

  // Validate coupon
  const now = new Date();
  if (coupon.validFrom > now || coupon.validTill < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  if (orderValue < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required`);
  }

  if (coupon.maxUsageCount && coupon.usedCount >= coupon.maxUsageCount) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
  if (userUsage && userUsage.usedCount >= coupon.maxUsagePerUser) {
    throw new ApiError(400, "You have reached the usage limit for this coupon");
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  const finalAmount = Math.max(0, orderValue - discount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        coupon: coupon.code,
        originalAmount: orderValue,
        discount,
        finalAmount,
      },
      "Coupon applied successfully"
    )
  );
});