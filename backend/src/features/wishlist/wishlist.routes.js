import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "./wishlist.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect); // sab protected

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Wishlist with product details }
 */
router.get("/", getWishlist);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *               productId: { type: string }
 *     responses:
 *       200: { description: Added to wishlist }
 *       400: { description: Already in wishlist }
 */
router.post("/", addToWishlist);

/**
 * @swagger
 * /wishlist/check/{productId}:
 *   get:
 *     summary: Check if product is in wishlist (for heart icon)
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "{ isInWishlist: true/false }" }
 */
router.get("/check/:productId", checkWishlist);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Removed }
 *       404: { description: Product not in wishlist }
 */
router.delete("/:productId", removeFromWishlist);

export default router;
