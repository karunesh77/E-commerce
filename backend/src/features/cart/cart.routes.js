import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "./cart.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

// Saare cart routes login required
router.use(protect);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Cart fetched (with calculated totals) }
 *       401: { description: Not authenticated }
 */
router.get("/", getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string, example: "65abc123..." }
 *               quantity:  { type: number, example: 2, default: 1 }
 *               size:      { type: string, example: "M" }
 *               color:     { type: string, example: "Red" }
 *     responses:
 *       200: { description: Item added }
 *       400: { description: Out of stock or invalid input }
 *       404: { description: Product not found }
 */
router.post("/add", addToCart);

/**
 * @swagger
 * /cart/item/{itemId}:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: number, example: 3 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Stock not available }
 *       404: { description: Item not found }
 */
router.put("/item/:itemId", updateCartItem);

/**
 * @swagger
 * /cart/item/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item removed }
 *       404: { description: Item not found }
 */
router.delete("/item/:itemId", removeCartItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Empty entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Cart cleared }
 */
router.delete("/clear", clearCart);

export default router;
