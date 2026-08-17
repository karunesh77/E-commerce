import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    "any.required": "Product name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 200 characters",
    "string.empty": "Name cannot be empty",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "any.required": "Description is required",
    "string.min": "Description must be at least 10 characters",
  }),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative",
  }),
  discountPrice: Joi.number().min(0).optional().allow(null).messages({
    "number.min": "Discount price cannot be negative",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "any.required": "Stock is required",
    "number.min": "Stock cannot be negative",
    "number.integer": "Stock must be a whole number",
  }),
  category: Joi.string().optional().allow("", null),
  brand: Joi.string().max(100).optional().allow(""),
  isFeatured: Joi.boolean().optional(),
});

// Update mein sabkuch optional hoga
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional().allow(null),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().optional().allow("", null),
  brand: Joi.string().max(100).optional().allow(""),
  isFeatured: Joi.boolean().optional(),
}).min(1); // Kam se kam 1 field toh hona chahiye update mein
