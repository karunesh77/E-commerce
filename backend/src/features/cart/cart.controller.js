import Cart from "./cart.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { addItemSchema, updateItemSchema } from "./cart.validation.js";
import { getOrCreateCart, formatCart } from "./cart.service.js";

// ─── GET CART ─────────────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const formatted = await formatCart(cart);

  return res.status(200).json(
    new ApiResponse(200, formatted, "Cart fetched successfully")
  );
});

// ─── ADD ITEM TO CART ─────────────────────────────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
  // Step 1: Validate input
  const { error, value } = addItemSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { productId, quantity, size, color } = value;

  // Step 2: Product exist karta hai?
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Step 3: Stock available hai?
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  // Step 4: User ka cart laao
  const cart = await getOrCreateCart(req.user._id);

  // Step 5: Same product + same variant pehle se cart mein hai?
  // (Different size/color ko alag item maano)
  const existingItem = cart.items.find(
    (item) =>
      String(item.product) === String(productId) &&
      item.size === (size || null) &&
      item.color === (color || null)
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) {
      throw new ApiError(
        400,
        `Cannot add more. Only ${product.stock} in stock, you already have ${existingItem.quantity}`
      );
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      size: size || null,
      color: color || null,
    });
  }

  await cart.save();
  const formatted = await formatCart(cart);

  return res.status(200).json(
    new ApiResponse(200, formatted, "Item added to cart")
  );
});

// ─── UPDATE ITEM QUANTITY ─────────────────────────────────────────────────────
export const updateCartItem = asyncHandler(async (req, res) => {
  const { error, value } = updateItemSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { quantity } = value;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  // Item dhundo cart ke items array mein
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  // Stock check
  const product = await Product.findById(item.product);
  if (!product) throw new ApiError(404, "Product no longer exists");
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items in stock`);
  }

  item.quantity = quantity;
  await cart.save();

  const formatted = await formatCart(cart);
  return res.status(200).json(
    new ApiResponse(200, formatted, "Cart updated successfully")
  );
});

// ─── REMOVE ITEM FROM CART ────────────────────────────────────────────────────
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  // Mongoose subdocument se remove
  cart.items.pull(itemId);
  await cart.save();

  const formatted = await formatCart(cart);
  return res.status(200).json(
    new ApiResponse(200, formatted, "Item removed from cart")
  );
});

// ─── CLEAR ENTIRE CART ────────────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = [];
  await cart.save();

  const formatted = await formatCart(cart);
  return res.status(200).json(
    new ApiResponse(200, formatted, "Cart cleared successfully")
  );
});
