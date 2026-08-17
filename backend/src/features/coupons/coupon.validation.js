import Joi from "joi";

export const validateCouponSchema = (data, isUpdate = false) => {
  const schema = Joi.object({
    code: isUpdate ? Joi.string().uppercase() : Joi.string().uppercase().required(),
    description: Joi.string().max(200).optional(),
    discountType: Joi.string().valid("percentage", "fixed").required(),
    discountValue: Joi.number().min(0).required(),
    maxDiscount: Joi.number().min(0).optional(),
    minOrderValue: Joi.number().min(0).default(0),
    maxUsageCount: Joi.number().min(1).optional(),
    maxUsagePerUser: Joi.number().min(1).default(1),
    applicableCategories: Joi.array().items(Joi.string()).optional(),
    applicableProducts: Joi.array().items(Joi.string()).optional(),
    excludedProducts: Joi.array().items(Joi.string()).optional(),
    validFrom: Joi.date().required(),
    validTill: Joi.date().required(),
    isActive: Joi.boolean().optional(),
  });

  return schema.validate(data);
};

export const validateApplyCouponSchema = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    orderValue: Joi.number().min(0).required(),
  });

  return schema.validate(data);
};