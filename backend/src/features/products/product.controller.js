import slugify from "slugify";
import Product from "./product.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";
import { uploadToCloudinary, deleteFromCloudinary } from "./product.service.js";

// ─── GET ALL PRODUCTS (with search, filter, sort, pagination) ─────────────────
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    q,                  // search: ?q=shirt
    category,           // ?category=64abc...
    brand,              // ?brand=nike
    minPrice,           // ?minPrice=500
    maxPrice,           // ?maxPrice=5000
    inStock,            // ?inStock=true
    isFeatured,         // ?isFeatured=true
    sort = "newest",    // ?sort=price_asc
    page = 1,           // ?page=2
    limit = 12,         // ?limit=20
  } = req.query;

  // ── Filter object build karo ──
  const filter = {};

  if (q) filter.$text = { $search: q };                     // full-text search
  if (category) filter.category = category;
  if (brand) filter.brand = new RegExp(brand, "i");         // case insensitive
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (isFeatured === "true") filter.isFeatured = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // ── Sort options ──
  const sortOptions = {
    newest:     { createdAt: -1 },
    oldest:     { createdAt: 1 },
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    rating:     { ratings: -1 },
    popular:    { numReviews: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  // ── Pagination ──
  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip     = (pageNum - 1) * limitNum;

  // ── DB queries parallel chalao — faster ──
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .select("-__v"),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    }, "Products fetched successfully")
  );
});

// ─── GET SINGLE PRODUCT BY ID ─────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .select("-__v");

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

// ─── GET PRODUCT BY SLUG (SEO friendly URL ke liye) ──────────────────────────
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug")
    .select("-__v");

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

// ─── CREATE PRODUCT (Admin only) ──────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  // Validate karo
  const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  // Product banao — slug pre-save hook mein auto generate hoga
  const product = await Product.create(value);

  return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// ─── UPDATE PRODUCT (Admin only) ──────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  // Agar name update ho raha hai toh slug bhi update karo
  // (findByIdAndUpdate pre-save hook trigger nahi karta, isliye manually)
  if (value.name) {
    value.slug = slugify(value.name, { lower: true, strict: true });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    value,
    { new: true, runValidators: true } // new:true → updated doc return karo
  ).select("-__v");

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

// ─── DELETE PRODUCT (Admin only) ──────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  // Pehle Cloudinary se saari images delete karo
  if (product.images.length > 0) {
    await Promise.all(
      product.images.map((img) => deleteFromCloudinary(img.public_id))
    );
  }

  await product.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ─── UPLOAD PRODUCT IMAGES (Admin only) ───────────────────────────────────────
export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one image");
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  // Sabhi images ek saath Cloudinary pe upload karo (parallel)
  const uploadResults = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer))
  );

  // Cloudinary response se url aur public_id nikalo
  const newImages = uploadResults.map((result) => ({
    url: result.secure_url,
    public_id: result.public_id,
  }));

  // Product ke images array mein add karo
  product.images.push(...newImages);
  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product.images, "Images uploaded successfully")
  );
});

// ─── DELETE SINGLE PRODUCT IMAGE (Admin only) ─────────────────────────────────
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Image dhundo
  const imageIndex = product.images.findIndex(
    (img) => img._id.toString() === imageId
  );
  if (imageIndex === -1) throw new ApiError(404, "Image not found");

  // Cloudinary se delete karo
  await deleteFromCloudinary(product.images[imageIndex].public_id);

  // Array se hata do
  product.images.splice(imageIndex, 1);
  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product.images, "Image deleted successfully")
  );
});
