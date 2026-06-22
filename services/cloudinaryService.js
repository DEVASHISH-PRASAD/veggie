import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaAsset = async (filePath, folderDestination) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `veggie_delivery/${folderDestination}`,
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload error: ${error.message}`);
  }
};

export { uploadMediaAsset };
