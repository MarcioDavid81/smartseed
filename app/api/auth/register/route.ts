import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { getUserFromToken } from "@/lib/auth";
import { ensureAdmin } from "@/lib/ensureAdmin";
import { sendUserWelcomeEmail } from "@/lib/send-user-welcome";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         aplication/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               companyId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       403:
 *         description: Acesso não autorizado
 *       500:
 *         description: Erro ao registrar usuário
 */

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromToken();
    ensureAdmin(authUser);
  } catch (err) {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const formData = await req.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyId = formData.get("companyId") as string;
  const avatar = formData.get("avatar") as File | null;

  if (!name || !email || !password || !companyId) {
    return NextResponse.json(
      { error: "Campos obrigatórios faltando" },
      { status: 400 }
    );
  }

  let imageUrl: string | null = null;

  if (avatar && avatar.size > 0) {
    try {
      const bytes = await avatar.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${avatar.type};base64,${base64}`;

      const uploaded = await cloudinary.uploader.upload(dataUrl, {
        folder: "avatars",
      });

      imageUrl = uploaded.secure_url;
    } catch (err) {
      console.error("Erro ao fazer upload no Cloudinary:", err);
      return NextResponse.json(
        { error: "Erro ao salvar imagem" },
        { status: 500 }
      );
    }
  }

  try {
    // Verifica se a empresa existe
    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o email já está cadastrado
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Cria o usuário
    const hashedPassword = await hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId,
        imageUrl,
        role: "USER",
      },
    });

    // Envia o e-mail de boas-vindas
    await sendUserWelcomeEmail({
      name: user.name,
      email: user.email,
      companyName: company.name,
    });

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return NextResponse.json(
      { error: "Erro interno ao criar o usuário" },
      { status: 500 }
    );
  }
}
