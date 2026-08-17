import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const addItemSchema = Joi.object({
  productId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid product ID",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).max(100).default(1),
  size:  Joi.string().max(20).optional().allow("", null),
  color: Joi.string().max(20).optional().allow("", null),
});

export const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required().messages({
    "any.required": "Quantity is required",
    "number.min": "Quantity must be at least 1",
  }),
});
