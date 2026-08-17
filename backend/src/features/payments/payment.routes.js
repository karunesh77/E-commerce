import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  placeCodOrder,
  handleWebhook,
} from "./payment.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Step 1 - Create Razorpay order (get order ID for checkout)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentMethod]
 *             properties:
 *               paymentMethod: { type: string, example: "razorpay" }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   name:    { type: string, example: "Karunesh Gupta" }
 *                   phone:   { type: string, example: "9876543210" }
 *                   street:  { type: string, example: "123 MG Road" }
 *                   city:    { type: string, example: "Jaipur" }
 *                   state:   { type: string, example: "Rajasthan" }
 *                   pincode: { type: string, example: "302001" }
 *     responses:
 *       200: { description: Razorpay order created with keyId and amount }
 *       400: { description: Cart empty or stock issue }
 */
router.post("/create-order", protect, createRazorpayOrder);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Step 2 - Verify Razorpay payment and place order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpayOrderId, razorpayPaymentId, razorpaySignature, shippingAddress]
 *             properties:
 *               razorpayOrderId:   { type: string }
 *               razorpayPaymentId: { type: string }
 *               razorpaySignature: { type: string }
 *               shippingAddress:   { type: object }
 *     responses:
 *       201: { description: Payment verified, order created }
 *       400: { description: Invalid signature }
 */
router.post("/verify", protect, verifyPayment);

/**
 * @swagger
 * /payments/cod:
 *   post:
 *     summary: Place Cash on Delivery order (no payment required)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentMethod]
 *             properties:
 *               paymentMethod: { type: string, example: "cod" }
 *               shippingAddress: { type: object }
 *     responses:
 *       201: { description: COD order placed }
 */
router.post("/cod", protect, placeCodOrder);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook (called by Razorpay server, not frontend)
 *     tags: [Payments]
 *     description: DO NOT call this manually. Razorpay calls this automatically.
 *     responses:
 *       200: { description: Webhook received }
 */
router.post("/webhook", handleWebhook); // webhook pe protect nahi — Razorpay khud call karta hai

export default router;
