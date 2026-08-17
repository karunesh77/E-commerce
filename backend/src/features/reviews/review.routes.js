import { Router } from "express";
import {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} from "./review.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router({ mergeParams: true }); // productId parent route se milega

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Reviews list with pagination }
 */
router.get("/", getProductReviews);

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Add review (only if product is purchased & delivered)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:  { type: number, minimum: 1, maximum: 5, example: 4 }
 *               comment: { type: string, example: "Great product! Very comfortable." }
 *     responses:
 *       201: { description: Review added }
 *       400: { description: Already reviewed }
 *       403: { description: Must purchase product first }
 */
router.post("/", protect, addReview);

/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   put:
 *     summary: Update your review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:  { type: number }
 *               comment: { type: string }
 *     responses:
 *       200: { description: Review updated }
 *       403: { description: Not your review }
 */
router.put("/:reviewId", protect, updateReview);

/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review (own review or admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review deleted }
 *       403: { description: Not authorized }
 */
router.delete("/:reviewId", protect, deleteReview);

export default router;
