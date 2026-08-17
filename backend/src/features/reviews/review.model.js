import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: [{ type: String }], // optional review images
  },
  { timestamps: true }
);

// Ek user ek product ko ek baar hi review kar sakta hai
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Review save/delete hone ke baad product ka avg rating auto-update
reviewSchema.statics.updateProductRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating:  { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const Product = (await import("../products/product.model.js")).default;

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings:    Math.round(stats[0].avgRating * 10) / 10, // 1 decimal
      numReviews: stats[0].numReviews,
    });
  } else {
    // Sab reviews delete ho gaye
    await Product.findByIdAndUpdate(productId, {
      ratings: 0, numReviews: 0,
    });
  }
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
