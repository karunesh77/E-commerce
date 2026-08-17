import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Shipping address rules
const shippingAddressSchema = Joi.object({
  name:    Joi.string().min(2).max(100).required(),
  phone:   Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    "string.pattern.base": "Please enter a valid 10-digit Indian mobile number",
  }),
  street:  Joi.string().min(5).max(200).required(),
  city:    Joi.string().min(2).max(100).required(),
  state:   Joi.string().min(2).max(100).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    "string.pattern.base": "Pincode must be 6 digits",
  }),
  country: Joi.string().default("India"),
});

// Order place karne ke liye
export const placeOrderSchema = Joi.object({
  shippingAddress: shippingAddressSchema.required(),
  paymentMethod:   Joi.string().valid("razorpay", "cod").required().messages({
    "any.only": "Payment method must be razorpay or cod",
  }),
  couponCode: Joi.string().optional().allow("", null),
});

// Admin order status update ke liye
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("confirmed", "processing", "shipped", "delivered", "cancelled")
    .required(),
  message: Joi.string().max(200).optional().allow(""),
});

// Order cancel ke liye
export const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(5).max(200).required().messages({
    "any.required": "Cancel reason is required",
    "string.min": "Reason must be at least 5 characters",
  }),
});
