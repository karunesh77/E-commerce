import Review from "./review.model.js";
import Order from "../orders/order.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Joi from "joi";

const reviewSchema = Joi.object({
  rating:  Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Comment must be at least 10 characters",
    "any.required": "Comment is required",
  }),
});

// ─── GET PRODUCT REVIEWS ──────────────────────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: req.params.productId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    }, "Reviews fetched successfully")
  );
});

// ─── ADD REVIEW ───────────────────────────────────────────────────────────────
export const addReview = asyncHandler(async (req, res) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { productId } = req.params;

  // Product exist karta hai?
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Sirf purchased user review kar sakta hai
  const hasPurchased = await Order.exists({
    user:   req.user._id,
    status: "delivered",
    "items.product": productId,
  });
  if (!hasPurchased) {
    throw new ApiError(403, "You can only review products you have purchased and received");
  }

  // Pehle se review diya hua hai?
  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) throw new ApiError(400, "You have already reviewed this product");

  const review = await Review.create({
    user:    req.user._id,
    product: productId,
    rating:  value.rating,
    comment: value.comment,
  });

  // Product ka avg rating update karo
  await Review.updateProductRating(product._id);

  await review.populate("user", "name avatar");

  return res.status(201).json(
    new ApiResponse(201, review, "Review added successfully")
  );
});

// ─── UPDATE REVIEW ────────────────────────────────────────────────────────────
export const updateReview = asyncHandler(async (req, res) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  // Sirf apna review edit kar sakta hai
  if (String(review.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to edit this review");
  }

  review.rating  = value.rating;
  review.comment = value.comment;
  await review.save();

  // Rating recalculate karo
  await Review.updateProductRating(review.product);

  return res.status(200).json(
    new ApiResponse(200, review, "Review updated successfully")
  );
});

// ─── DELETE REVIEW ────────────────────────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  // User apna review delete kare ya admin kisi ka bhi
  if (
    String(review.user) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  const productId = review.product;
  await review.deleteOne();

  // Rating recalculate karo
  await Review.updateProductRating(productId);

  return res.status(200).json(
    new ApiResponse(200, null, "Review deleted successfully")
  );
});
