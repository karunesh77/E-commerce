import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
} from "./product.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (with filters, search, pagination)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: inStock
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, price_asc, price_desc, rating, popular] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200: { description: Products fetched successfully }
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug (SEO friendly URL)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product found }
 *       404: { description: Product not found }
 */
router.get("/slug/:slug", getProductBySlug);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product found }
 *       404: { description: Product not found }
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock]
 *             properties:
 *               name:          { type: string, example: "Nike Air Max" }
 *               description:   { type: string, example: "Premium running shoes with great comfort" }
 *               price:         { type: number, example: 4999 }
 *               discountPrice: { type: number, example: 3999 }
 *               stock:         { type: number, example: 50 }
 *               brand:         { type: string, example: "Nike" }
 *               category:      { type: string }
 *               isFeatured:    { type: boolean }
 *     responses:
 *       201: { description: Product created }
 *       400: { description: Validation failed }
 *       403: { description: Admin access required }
 */
router.post("/", protect, restrictTo("admin"), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:          { type: string }
 *               description:   { type: string }
 *               price:         { type: number }
 *               discountPrice: { type: number }
 *               stock:         { type: number }
 *               brand:         { type: string }
 *               isFeatured:    { type: boolean }
 *     responses:
 *       200: { description: Product updated }
 *       404: { description: Product not found }
 */
router.put("/:id", protect, restrictTo("admin"), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 *       404: { description: Product not found }
 */
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

/**
 * @swagger
 * /products/{id}/images:
 *   post:
 *     summary: Upload product images (Admin only, max 5)
 *     tags: [Products]
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200: { description: Images uploaded }
 *       400: { description: No images provided }
 */
router.post(
  "/:id/images",
  protect,
  restrictTo("admin"),
  upload.array("images", 5),
  uploadProductImages
);

/**
 * @swagger
 * /products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete a single product image (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Image deleted }
 *       404: { description: Image not found }
 */
router.delete(
  "/:id/images/:imageId",
  protect,
  restrictTo("admin"),
  deleteProductImage
);

export default router;
