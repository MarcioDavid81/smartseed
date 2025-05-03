import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImageToCloudinary = async (image: File): Promise<string> => {
  const buffer = await image.arrayBuffer();
  const base64Image = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${image.type};base64,${base64Image}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "avatars",
  });

  return result.secure_url;
};
