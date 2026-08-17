import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "./order.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect); // Sab routes protected

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Orders fetched }
 */
router.get("/", getMyOrders);

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200: { description: All orders }
 *       403: { description: Admin access required }
 */
router.get("/admin", restrictTo("admin"), getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID (with timeline)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order detail }
 *       403: { description: Not your order }
 *       404: { description: Order not found }
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel order (user can cancel pending/confirmed orders only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, example: "Changed my mind" }
 *     responses:
 *       200: { description: Order cancelled }
 *       400: { description: Cannot cancel at current status }
 */
router.put("/:id/cancel", cancelOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, processing, shipped, delivered, cancelled]
 *               message: { type: string, example: "Shipped via Bluedart" }
 *     responses:
 *       200: { description: Status updated }
 */
router.put("/:id/status", restrictTo("admin"), updateOrderStatus);

export default router;
