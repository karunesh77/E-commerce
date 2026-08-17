import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    // Parent category — nested categories ke liye
    // Example: Electronics > Phones > Smartphones
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null matlab top-level category
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Virtuals JSON response mein dikhayenge
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field — children categories (DB mein store nahi hota)
// Aise use karenge: category.children
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Name change pe slug auto-update
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Indexes
categorySchema.index({ parent: 1, isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
