import jwt from "jsonwebtoken";

// Short-lived token — har request ke saath bheja jaata hai
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // 15m
  );
};

// Long-lived token — access token expire hone pe naya lene ke liye use hota hai
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // 7d
  );
};

// Dono tokens banao aur refreshToken DB mein save karo
export const generateTokensAndSave = async (user) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // DB mein save karo taaki logout pe invalidate kar sakein
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
