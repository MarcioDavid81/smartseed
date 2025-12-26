import { getAuthUserOrThrow, requireAdmin, verifyToken } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/prisma";
import { createUserSchema } from "@/lib/schemas/userSchema";
import { sendUserWelcomeEmail } from "@/lib/send-user-welcome";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


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
 *         multipart/form-data:
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
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserOrThrow();
    requireAdmin(authUser)
    const formData = await req.formData();
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = createUserSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;
    const avatar = formData.get("avatar") as File | null;

    console.log("avatar raw:", avatar);
    console.log("is File:", avatar instanceof File);

    let imageUrl: string | null = null;
    if (avatar && avatar.size > 0) {
      imageUrl = await uploadImageToCloudinary(avatar);
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        imageUrl,
        role: Role.USER,
        companyId: authUser.companyId,
      },
    });

    await sendUserWelcomeEmail({
      name: user.name,
      email: user.email,
      companyName: authUser.company.name,
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao criar usuário" },
      { status: 500 },
    );
  }
}
/**
 * @swagger
 * /api/auth/register:
 *   get:
 *     summary: Buscar uma lista de usuários
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
 *         description: Lista de usuários retornada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       403:
 *         description: Acesso não autorizado
 *       500:
 *         description: Erro ao listar usuários
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const user = await db.user.findMany({
      where: {
        companyId,
      },
      include: {
        company: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar usuários" },
      { status: 500 },
    );
  }
}
