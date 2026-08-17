import UserProfile from "./user.model.js";
import User from "../auth/auth.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { validateAddressSchema, validateProfileSchema } from "./user.validation.js";

// ─── GET USER PROFILE ──────────────────────────────────────────────────────
export const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ user: req.user._id })
    .populate("user", "email firstName lastName");

  if (!profile) {
    throw new ApiError(404, "User profile not found");
  }

  res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

// ─── UPDATE USER PROFILE ───────────────────────────────────────────────────
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { error, value } = validateProfileSchema(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  let profile = await UserProfile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await UserProfile.create({ user: req.user._id, ...value });
  } else {
    Object.assign(profile, value);
    await profile.save();
  }

  res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
});

// ─── ADD ADDRESS ───────────────────────────────────────────────────────────
export const addAddress = asyncHandler(async (req, res) => {
  const { error, value } = validateAddressSchema(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  let profile = await UserProfile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await UserProfile.create({
      user: req.user._id,
      addresses: [value],
    });
  } else {
    // If isDefault is true, remove default from other addresses
    if (value.isDefault) {
      profile.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }
    profile.addresses.push(value);
    await profile.save();
  }

  res.status(201).json(new ApiResponse(201, profile, "Address added successfully"));
});

// ─── UPDATE ADDRESS ────────────────────────────────────────────────────────
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { error, value } = validateAddressSchema(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const profile = await UserProfile.findOne({
    user: req.user._id,
    "addresses._id": addressId,
  });

  if (!profile) {
    throw new ApiError(404, "Address not found");
  }

  const address = profile.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");

  // If isDefault is true, remove default from other addresses
  if (value.isDefault) {
    profile.addresses.forEach((addr) => {
      if (!addr._id.equals(addressId)) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, value);
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, "Address updated successfully"));
});

// ─── DELETE ADDRESS ────────────────────────────────────────────────────────
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const profile = await UserProfile.findOne({
    user: req.user._id,
    "addresses._id": addressId,
  });

  if (!profile) {
    throw new ApiError(404, "Address not found");
  }

  profile.addresses.id(addressId).deleteOne();
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, "Address deleted successfully"));
});

// ─── GET ALL ADDRESSES ─────────────────────────────────────────────────────
export const getAddresses = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ user: req.user._id });

  if (!profile) {
    throw new ApiError(404, "User profile not found");
  }

  res.status(200).json(
    new ApiResponse(200, profile.addresses, "Addresses fetched successfully")
  );
});

// ─── SET DEFAULT ADDRESS ───────────────────────────────────────────────────
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const profile = await UserProfile.findOne({ user: req.user._id });

  if (!profile) {
    throw new ApiError(404, "User profile not found");
  }

  // Remove default from all addresses
  profile.addresses.forEach((addr) => {
    addr.isDefault = false;
  });

  // Set this address as default
  const address = profile.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");

  address.isDefault = true;
  await profile.save();

  res
    .status(200)
    .json(new ApiResponse(200, profile, "Default address updated successfully"));
});
