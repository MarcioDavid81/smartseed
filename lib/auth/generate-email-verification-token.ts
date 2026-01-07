import { randomBytes } from "crypto";
import { db } from "@/lib/prisma";

interface GenerateEmailVerificationTokenProps {
  userId: string;
}

export async function generateEmailVerificationToken({
  userId,
}: GenerateEmailVerificationTokenProps) {
  // 🔐 token seguro (hex)
  const token = randomBytes(32).toString("hex");

  // ⏱️ expira em 24h
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 🔄 remove tokens antigos do usuário (boa prática)
  await db.emailVerificationToken.deleteMany({
    where: {
      userId,
    },
  });

  // 💾 salva o novo token
  await db.emailVerificationToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}
