import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSalesReport,
  getTopProducts,
  getInventoryStatus,
} from "./admin.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get("/dashboard", getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Admin]
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
 *         name: search
 *         schema: { type: string }
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 */
router.patch("/users/:userId/role", updateUserRole);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/users/:userId", deleteUser);

/**
 * @swagger
 * /admin/sales-report:
 *   get:
 *     summary: Get sales report with date filter
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 */
router.get("/sales-report", getSalesReport);

/**
 * @swagger
 * /admin/top-products:
 *   get:
 *     summary: Get top selling products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 */
router.get("/top-products", getTopProducts);

/**
 * @swagger
 * /admin/inventory:
 *   get:
 *     summary: Get inventory status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 */
router.get("/inventory", getInventoryStatus);

export default router;