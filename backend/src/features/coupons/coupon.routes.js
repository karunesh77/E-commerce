import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponDetails,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
} from "./coupon.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate coupon code
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               orderValue:
 *                 type: number
 */
router.post("/validate", protect, validateCoupon);

/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply coupon to order
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 */
router.post("/apply", protect, applyCoupon);

// Admin routes
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create new coupon (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Get all coupons (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 */
router.post("/", createCoupon);
router.get("/", getAllCoupons);

/**
 * @swagger
 * /coupons/{couponId}:
 *   get:
 *     summary: Get coupon details (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     summary: Update coupon (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete coupon (Admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:couponId", getCouponDetails);
router.patch("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);

export default router;