"use server";

import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export const updateUserWithImageAndPassword = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const image = formData.get("image") as File | null;

  if (!id || !name || !email) {
    throw new Error("Dados obrigatórios faltando.");
  }

  let imageUrl: string | undefined;
  if (image && typeof image === "object") {
    imageUrl = await uploadImageToCloudinary(image);
  }

  const data: any = {
    name,
    email,
    ...(imageUrl && { imageUrl }),
    ...(password && { password: await bcrypt.hash(password, 10) }),
  };

  await db.user.update({
    where: { id },
    data,
  });

  revalidatePath("/"); // ou outra rota que precise ser atualizada
};
