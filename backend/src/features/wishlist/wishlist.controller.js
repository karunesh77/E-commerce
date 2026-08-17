import Wishlist from "./wishlist.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ─── GET WISHLIST ─────────────────────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
    "name slug price discountPrice images ratings stock isActive"
  );

  // Wishlist nahi hai toh empty return karo
  if (!wishlist) {
    return res.status(200).json(
      new ApiResponse(200, { products: [] }, "Wishlist is empty")
    );
  }

  // Deleted/inactive products filter out karo
  wishlist.products = wishlist.products.filter((p) => p !== null && p.isActive);

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Wishlist fetched successfully")
  );
});

// ─── ADD TO WISHLIST ──────────────────────────────────────────────────────────
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "Product ID is required");

  // Product exist karta hai?
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Wishlist laao ya banao
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  // Already wishlist mein hai?
  const alreadyAdded = wishlist.products.some(
    (id) => String(id) === String(productId)
  );
  if (alreadyAdded) {
    throw new ApiError(400, "Product already in wishlist");
  }

  wishlist.products.push(productId);
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Added to wishlist")
  );
});

// ─── REMOVE FROM WISHLIST ─────────────────────────────────────────────────────
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) throw new ApiError(404, "Wishlist not found");

  const existed = wishlist.products.some((id) => String(id) === String(productId));
  if (!existed) throw new ApiError(404, "Product not in wishlist");

  wishlist.products = wishlist.products.filter(
    (id) => String(id) !== String(productId)
  );
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Removed from wishlist")
  );
});

// ─── CHECK IF IN WISHLIST ─────────────────────────────────────────────────────
// Frontend pe heart icon fill/empty karne ke liye
export const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  const isInWishlist = wishlist?.products.some(
    (id) => String(id) === String(productId)
  ) || false;

  return res.status(200).json(
    new ApiResponse(200, { isInWishlist }, "Checked")
  );
});
