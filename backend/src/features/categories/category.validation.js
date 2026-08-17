import Joi from "joi";

// MongoDB ObjectId pattern — 24 hex characters
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "any.required": "Category name is required",
    "string.min": "Name must be at least 2 characters",
    "string.empty": "Name cannot be empty",
  }),
  description: Joi.string().max(500).optional().allow(""),
  parent: Joi.string().pattern(objectIdPattern).optional().allow(null, "").messages({
    "string.pattern.base": "Invalid parent category ID",
  }),
  isActive: Joi.boolean().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(500).optional().allow(""),
  parent: Joi.string().pattern(objectIdPattern).optional().allow(null, ""),
  isActive: Joi.boolean().optional(),
}).min(1); // kam se kam 1 field hona chahiye
