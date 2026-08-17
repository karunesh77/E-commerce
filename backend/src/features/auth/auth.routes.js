import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from "./auth.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: "Karunesh Gupta" }
 *               email:    { type: string, example: "user@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation failed }
 *       409: { description: Email already registered }
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "user@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200: { description: Login successful, tokens set in cookies }
 *       401: { description: Invalid email or password }
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid or expired refresh token }
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (clears cookies, invalidates refresh token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Logged out successfully }
 *       401: { description: Not authenticated }
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200: { description: User data returned }
 *       401: { description: Not authenticated }
 */
router.get("/me", protect, getMe);

export default router;
