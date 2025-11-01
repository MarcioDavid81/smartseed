import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth";
import { sendUserUpdatedEmail } from "@/lib/send-user-updated";
import { Role } from "@prisma/client";

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
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const body = await req.json();
    const { name, email, password, companyId, avatar } = body;

    // Busca o usuário atual
    const currentUser = await db.user.findUnique({ 
      where: { id },
      include: { company: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Prepara os dados para atualização (merge com dados existentes)
    const updateData: any = {};
    let originalPassword: string | null = null;

    // Nome - usa o fornecido ou mantém o atual
    if (name !== undefined) {
      updateData.name = name;
    }

    // Email - valida se fornecido e se não está em uso por outro usuário
    if (email !== undefined) {
      if (email !== currentUser.email) {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
          return NextResponse.json(
            { error: "Email já cadastrado" },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }

    // Senha - hash apenas se fornecida
    if (password !== undefined) {
      originalPassword = password; // Armazena a senha original para o email
      updateData.password = await hash(password, 10);
    }

    // CompanyId - valida se a empresa existe apenas se fornecida
    if (companyId !== undefined) {
      if (companyId !== currentUser.companyId) {
        const company = await db.company.findUnique({ where: { id: companyId } });
        if (!company) {
          return NextResponse.json(
            { error: "Empresa não encontrada" },
            { status: 404 }
          );
        }
      }
      updateData.companyId = companyId;
    }

    // Avatar - processa upload apenas se fornecido
    if (avatar && typeof avatar === "string" && avatar.startsWith("data:")) {
      try {
        const uploaded = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });
        updateData.imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Erro ao fazer upload no Cloudinary:", err);
        return NextResponse.json(
          { error: "Erro ao salvar imagem" },
          { status: 500 },
        );
      }
    }

    // Verifica se há pelo menos um campo para atualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo fornecido para atualização" },
        { status: 400 }
      );
    }

    // Atualiza o usuário
    const userUpdated = await db.user.update({
      where: { id: id },
      data: updateData,
    });

    // Envia email apenas se senha, email ou nome foram alterados
    if (originalPassword || email !== undefined || name !== undefined) {
      await sendUserUpdatedEmail({
        name: userUpdated.name,
        email: userUpdated.email,
        password: originalPassword || "Senha não alterada",
      });
    }

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
  } catch (err) {
    console.error("Erro no PUT /api/auth/register/[id]:", err);
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
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Busca o usuário atual
    const existing = await db.user.findUnique({ 
      where: { id },
      include: { company: true }
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return NextResponse.json(
        { error: "Usuário não pertence à empresa atual" },
        { status: 404 }
      );
    }

      // Exclui o usuário
      await db.user.delete({
        where: { id },
      });
      
      return NextResponse.json(
        { message: "Usuário excluído com sucesso" },
        { status: 200 }
      );
  } catch (err) {
    console.error("Erro no DELETE /api/auth/register/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 },
    );    
  }
  }
