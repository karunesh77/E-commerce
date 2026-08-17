import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories (flat or tree)
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: tree
 *         schema: { type: boolean, default: false }
 *         description: Set true to get nested tree structure
 *       - in: query
 *         name: activeOnly
 *         schema: { type: boolean, default: false }
 *         description: Set true to get only active categories
 *     responses:
 *       200: { description: Categories fetched successfully }
 */
router.get("/", getAllCategories);

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category found }
 *       404: { description: Category not found }
 */
router.get("/slug/:slug", getCategoryBySlug);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category found }
 *       404: { description: Category not found }
 */
router.get("/:id", getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string, example: "Electronics" }
 *               description: { type: string, example: "All electronic items" }
 *               parent:      { type: string, description: "Parent category ID (optional)" }
 *               isActive:    { type: boolean, default: true }
 *               image:       { type: string, format: binary }
 *     responses:
 *       201: { description: Category created }
 *       400: { description: Validation failed }
 *       403: { description: Admin access required }
 */
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               parent:      { type: string }
 *               isActive:    { type: boolean }
 *               image:       { type: string, format: binary }
 *     responses:
 *       200: { description: Category updated }
 *       404: { description: Category not found }
 */
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     description: Cannot delete if sub-categories or products are linked to it
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category deleted }
 *       400: { description: Has children or linked products }
 *       404: { description: Category not found }
 */
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

export default router;
