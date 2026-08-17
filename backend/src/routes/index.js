import { Router } from "express";
import authRoutes         from "../features/auth/auth.routes.js";
import productRoutes      from "../features/products/product.routes.js";
import categoryRoutes     from "../features/categories/category.routes.js";
import cartRoutes         from "../features/cart/cart.routes.js";
import orderRoutes        from "../features/orders/order.routes.js";
import paymentRoutes      from "../features/payments/payment.routes.js";
import wishlistRoutes     from "../features/wishlist/wishlist.routes.js";
import reviewRoutes       from "../features/reviews/review.routes.js";
import userRoutes         from "../features/users/user.routes.js";
import adminRoutes        from "../features/admin/admin.routes.js";
import notificationRoutes from "../features/notifications/notification.routes.js";
import couponRoutes       from "../features/coupons/coupon.routes.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Feature routes
router.use("/auth",          authRoutes);
router.use("/products",      productRoutes);
router.use("/categories",    categoryRoutes);
router.use("/cart",          cartRoutes);
router.use("/orders",        orderRoutes);
router.use("/payments",      paymentRoutes);
router.use("/wishlist",      wishlistRoutes);
router.use("/users",         userRoutes);
router.use("/admin",         adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/coupons",       couponRoutes);

// Reviews — product ke andar nested route
// /api/v1/products/:productId/reviews
router.use("/products/:productId/reviews", reviewRoutes);

export default router;
