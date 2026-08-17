import jwt from "jsonwebtoken";
import User from "../features/auth/auth.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── PROTECT ──────────────────────────────────────────────────────────────────
// Sirf logged-in users hi aage ja sakte hain
export const protect = asyncHandler(async (req, res, next) => {
  // Token do jagah se aa sakta hai:
  // 1. Cookie (browser use karta hai)
  // 2. Authorization header (mobile app / Postman use karta hai)
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) throw new ApiError(401, "Access denied. Please login");

  // Token verify karo — invalid ya expired hone pe error.middleware pakad lega
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // DB se fresh user data lo
  const user = await User.findById(decoded._id);
  if (!user) throw new ApiError(401, "User no longer exists");

  // req.user mein daal do — controller mein req.user se access kar sakte hain
  req.user = user;
  next();
});

// ─── RESTRICT TO ──────────────────────────────────────────────────────────────
// Sirf specific roles ko allow karo (e.g. admin only)
// Usage: router.delete("/product/:id", protect, restrictTo("admin"), deleteProduct)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };
};
