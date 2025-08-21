import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/insumos/products/{id}:
 *   put:
 *     summary: Atualizar um insumo
 *     tags:
 *       - Cadastro de Insumos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do insumo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               class:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Insumo atualizado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Insumo não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { name, description, class: productClass, unit } = await req.json();

    const existing = await db.product.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Produto não encontrado ou acesso negado", { status: 403 });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(productClass && { class: productClass }),
        ...(unit && { unit }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/insumos/products/{id}:
 *   delete:
 *     summary: Deletar um insumo
 *     tags:
 *       - Cadastro de Insumos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do insumo
 *     responses:
 *       200:
 *         description: Insumo deletado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Insumo não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o produto para garantir que pertence à empresa do usuário
    const existing = await db.product.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Produto não encontrado ou acesso negado", { status: 403 });
    }

    const deleted = await db.product.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o produto para garantir que pertence à empresa do usuário
    const produto = await db.product.findUnique({ where: { id } });

    if (!produto || produto.companyId !== payload.companyId) {
      return new NextResponse("Produto não encontrado ou acesso negado", { status: 403 });
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}