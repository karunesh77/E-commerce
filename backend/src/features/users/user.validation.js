import Joi from "joi";

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const postalCodeRegex = /^[0-9]{5,10}$/;

export const validateProfileSchema = (data) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().pattern(phoneRegex).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    bio: Joi.string().max(500).optional(),
    preferences: Joi.object({
      newsletter: Joi.boolean().optional(),
      notifications: Joi.boolean().optional(),
      smsAlerts: Joi.boolean().optional(),
    }).optional(),
  });

  return schema.validate(data);
};

export const validateAddressSchema = (data) => {
  const schema = Joi.object({
    label: Joi.string().valid("home", "work", "other").default("other"),
    fullName: Joi.string().min(2).required(),
    phone: Joi.string().pattern(phoneRegex).required(),
    street: Joi.string().min(5).required(),
    city: Joi.string().min(2).required(),
    state: Joi.string().min(2).required(),
    postalCode: Joi.string().pattern(postalCodeRegex).required(),
    country: Joi.string().min(2).default("India"),
    isDefault: Joi.boolean().optional(),
  });

  return schema.validate(data);
};
