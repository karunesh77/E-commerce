import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateTokensAndSave } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

// Cookie settings — httpOnly matlab JS se access nahi hoga (XSS safe)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // production mein sirf HTTPS
  sameSite: "strict",
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  // Step 1: Input validate karo
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  const { name, email, password } = value;

  // Step 2: Email pehle se registered hai?
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "Email already registered");

  // Step 3: User banao (password pre-save hook mein auto hash hoga)
  const user = await User.create({ name, email, password });

  // Step 4: Tokens banao aur DB mein refreshToken save karo
  const { accessToken, refreshToken } = await generateTokensAndSave(user);

  // Step 5: Sirf safe data bhejo (password, refreshToken hide)
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(new ApiResponse(201, { user: userData, accessToken }, "Registered successfully"));
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  // Step 1: Validate karo
  const { error, value } = loginSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { email, password } = value;

  // Step 2: User dhundo — .select("+password") kyunki schema mein select:false hai
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  // Step 3: Password compare karo
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  // Step 4: Tokens banao
  const { accessToken, refreshToken } = await generateTokensAndSave(user);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { user: userData, accessToken }, "Login successful"));
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // DB se refreshToken hata do — ab ye token invalid ho gaya
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Cookie ya body se refreshToken lo
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Refresh token missing");

  // Verify karo
  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // DB se user dhundo aur token match karo
  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token is invalid or already used");
  }

  // Naye tokens banao (Refresh Token Rotation — security best practice)
  const { accessToken, refreshToken } = await generateTokensAndSave(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
});

// ─── GET ME ───────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user auth.middleware mein set hota hai
  const user = await User.findById(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});
