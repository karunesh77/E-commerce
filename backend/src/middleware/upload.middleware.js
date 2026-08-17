import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Files disk pe nahi, memory mein rakhenge
// Phir wahan se seedha Cloudinary pe upload karenge
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // accept karo
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false); // reject karo
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
});
