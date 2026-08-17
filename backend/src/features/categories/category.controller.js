import slugify from "slugify";
import Category from "./category.model.js";
import Product from "../products/product.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../products/product.service.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

// ─── HELPER: Recursive tree builder ───────────────────────────────────────────
// Flat array ko nested tree mein convert karta hai
const buildTree = (categories, parentId = null) => {
  return categories
    .filter((cat) => String(cat.parent) === String(parentId))
    .map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      isActive: cat.isActive,
      children: buildTree(categories, cat._id), // recursive call
    }));
};

// ─── GET ALL CATEGORIES ───────────────────────────────────────────────────────
// ?tree=true → nested tree response
// ?tree=false → flat array response
export const getAllCategories = asyncHandler(async (req, res) => {
  const { tree = "false", activeOnly = "false" } = req.query;

  const filter = {};
  if (activeOnly === "true") filter.isActive = true;

  const categories = await Category.find(filter)
    .populate("parent", "name slug")
    .sort({ name: 1 })
    .lean(); // lean() → plain JS objects, faster

  if (tree === "true") {
    const treeData = buildTree(categories);
    return res.status(200).json(
      new ApiResponse(200, treeData, "Categories fetched successfully")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched successfully")
  );
});

// ─── GET CATEGORY BY ID ───────────────────────────────────────────────────────
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate("parent", "name slug")
    .populate("children", "name slug image"); // virtual field

  if (!category) throw new ApiError(404, "Category not found");

  return res.status(200).json(
    new ApiResponse(200, category, "Category fetched successfully")
  );
});

// ─── GET CATEGORY BY SLUG ─────────────────────────────────────────────────────
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate("parent", "name slug")
    .populate("children", "name slug image");

  if (!category) throw new ApiError(404, "Category not found");

  return res.status(200).json(
    new ApiResponse(200, category, "Category fetched successfully")
  );
});

// ─── CREATE CATEGORY (Admin only) ─────────────────────────────────────────────
export const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  // Empty string ko null mein convert karo
  if (value.parent === "") value.parent = null;

  // Agar parent diya hai toh verify karo ki exist karta hai
  if (value.parent) {
    const parentExists = await Category.findById(value.parent);
    if (!parentExists) throw new ApiError(400, "Parent category not found");
  }

  // Image upload (optional)
  if (req.file) {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "ecommerce/categories"
    );
    value.image = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  const category = await Category.create(value);

  return res.status(201).json(
    new ApiResponse(201, category, "Category created successfully")
  );
});

// ─── UPDATE CATEGORY (Admin only) ─────────────────────────────────────────────
export const updateCategory = asyncHandler(async (req, res) => {
  const { error, value } = updateCategorySchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  // Self-parent prevent karo — category apni parent nahi ho sakti
  if (value.parent && String(value.parent) === String(category._id)) {
    throw new ApiError(400, "A category cannot be its own parent");
  }

  // Empty string ko null banao
  if (value.parent === "") value.parent = null;

  // Naya parent valid hai check karo
  if (value.parent) {
    const parentExists = await Category.findById(value.parent);
    if (!parentExists) throw new ApiError(400, "Parent category not found");
  }

  // Name change ho raha hai toh slug update karo
  if (value.name) {
    value.slug = slugify(value.name, { lower: true, strict: true });
  }

  // Naya image aaya — purana Cloudinary se delete karo
  if (req.file) {
    if (category.image?.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "ecommerce/categories"
    );
    value.image = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  const updated = await Category.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json(
    new ApiResponse(200, updated, "Category updated successfully")
  );
});

// ─── DELETE CATEGORY (Admin only) ─────────────────────────────────────────────
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  // Safety check 1: Children categories hain toh delete mat karne do
  const hasChildren = await Category.exists({ parent: category._id });
  if (hasChildren) {
    throw new ApiError(
      400,
      "Cannot delete: this category has sub-categories. Delete or reassign them first."
    );
  }

  // Safety check 2: Products linked hain toh mat karne do
  const hasProducts = await Product.exists({ category: category._id });
  if (hasProducts) {
    throw new ApiError(
      400,
      "Cannot delete: products are linked to this category. Reassign them first."
    );
  }

  // Cloudinary se image delete karo
  if (category.image?.public_id) {
    await deleteFromCloudinary(category.image.public_id);
  }

  await category.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Category deleted successfully")
  );
});
