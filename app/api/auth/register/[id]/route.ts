import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth";
import { sendUserUpdatedEmail } from "@/lib/send-user-updated";
import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * @swagger
 * /api/auth/register/{id}:
 *   put:
 *     summary: Atualizar um usuário existente (atualização parcial)
 *     description: Permite atualizar apenas os campos fornecidos, mantendo os demais valores inalterados
 *     tags:
 *       - Autenticação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário (opcional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário (opcional)
 *               password:
 *                 type: string
 *                 description: Nova senha do usuário (opcional)
 *               companyId:
 *                 type: string
 *                 description: ID da empresa (opcional)
 *               avatar:
 *                 type: string
 *                 description: Avatar em base64 (data:image/type;base64,...) (opcional)
 *             additionalProperties: false
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Nenhum campo fornecido ou email já cadastrado
 *       404:
 *         description: Usuário ou empresa não encontrada
 *       401:
 *         description: Token ausente ou inválido
 *       500:
 *         description: Erro ao atualizar usuário
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    /* =========================
       AUTH
    ========================= */
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    /* =========================
       FORM DATA
    ========================= */
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const avatar = formData.get("avatar") as File | null;

    /* =========================
       USUÁRIO ATUAL
    ========================= */
    const currentUser = await db.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    /* =========================
       PREPARA UPDATE
    ========================= */
    const updateData: Record<string, any> = {};
    let originalPassword: string | null = null;

    // Nome
    if (name !== null && name !== currentUser.name) {
      updateData.name = name;
    }

    // Email
    if (email !== null && email !== currentUser.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 },
        );
      }

      updateData.email = email;
    }

    // Senha
    if (password) {
      originalPassword = password;
      updateData.password = await hash(password, 10);
    }

    // Empresa
    if (companyId && companyId !== currentUser.companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 },
        );
      }

      updateData.companyId = companyId;
    }

    // Avatar
    if (avatar && avatar.size > 0) {
      try {
        updateData.imageUrl = await uploadImageToCloudinary(avatar);
      } catch (error) {
        console.error("Erro Cloudinary:", error);
        return NextResponse.json(
          { error: "Erro ao salvar imagem" },
          { status: 500 },
        );
      }
    }

    /* =========================
       VALIDA UPDATE
    ========================= */
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo fornecido para atualização" },
        { status: 400 },
      );
    }

    /* =========================
       UPDATE
    ========================= */
    const userUpdated = await db.user.update({
      where: { id },
      data: updateData,
    });

    /* =========================
       EMAIL
    ========================= */
    if (originalPassword || name !== null || email !== null) {
      await sendUserUpdatedEmail({
        name: userUpdated.name,
        email: userUpdated.email,
        password: originalPassword || "Senha não alterada",
      });
    }
    /* =========================
       RESPONSE
    ========================= */
    return NextResponse.json(
      {
        message: "Usuário atualizado com sucesso",
        user: {
          id: userUpdated.id,
          name: userUpdated.name,
          email: userUpdated.email,
          companyId: userUpdated.companyId,
          imageUrl: userUpdated.imageUrl,
          role: userUpdated.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro no PUT /api/auth/register/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Busca o usuário atual
    const existing = await db.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Usuário não pertence à empresa atual" },
        { status: 404 },
      );
    }

    // Exclui o usuário
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Usuário excluído com sucesso" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Erro no DELETE /api/auth/register/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Busca o usuário atual
    const existing = await db.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Usuário não pertence à empresa atual" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Usuário encontrado com sucesso",
        user: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          companyId: existing.companyId,
          imageUrl: existing.imageUrl,
          role: existing.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
