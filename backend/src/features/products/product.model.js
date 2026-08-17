import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
      validate: {
        validator: function (val) {
          // null hai toh skip karo, warna price se kam hona chahiye
          return val === null || val < this.price;
        },
        message: "Discount price must be less than original price",
      },
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }, // Cloudinary delete ke liye zaroori
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Category feature banega tab kaam aayega
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Name se auto slug banana — save hone se PEHLE
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Search aur filter ke liye indexes — queries fast hongi
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1 });
// Note: slug pe index already hai (unique:true se), isliye yahan dobara nahi likha

const Product = mongoose.model("Product", productSchema);

export default Product;
