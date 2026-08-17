import { Readable } from "stream";
import cloudinary from "../../config/cloudinary.js";

// Memory buffer ko Cloudinary pe upload karo
export const uploadToCloudinary = (buffer, folder = "ecommerce/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    // Buffer ko readable stream mein convert karo aur pipe karo
    Readable.from(buffer).pipe(stream);
  });
};

// Cloudinary se image delete karo (product delete ya image remove pe use hoga)
export const deleteFromCloudinary = async (public_id) => {
  return await cloudinary.uploader.destroy(public_id);
};
