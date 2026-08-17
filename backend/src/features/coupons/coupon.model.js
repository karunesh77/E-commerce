import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      maxlength: 200,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      description: "Max discount amount (for percentage discounts)",
    },
    minOrderValue: {
      type: Number,
      default: 0,
      description: "Minimum order value to apply coupon",
    },
    maxUsageCount: {
      type: Number,
      description: "Max times coupon can be used globally",
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1,
      description: "Max times single user can use coupon",
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    validFrom: {
      type: Date,
      required: true,
    },
    validTill: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedCount: Number,
        lastUsedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Index for quick queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validTill: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
