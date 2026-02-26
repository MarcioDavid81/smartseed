import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";

/**
 * @swagger
 * /api/insumos/applications/{id}:
 *   put:
 *     summary: Atualizar aplicação de insumos
 *     tags:
 *       - Aplicação de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productStockId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               talhaoId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aplicação de insumo atualizada com sucesso
 */
const updateApplicationSchema = z.object({
  productStockId: z.string().cuid(),
  quantity: z.number().positive(),
  talhaoId: z.string().cuid(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  cycleId: z.string().cuid().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const body = await req.json();
    const data = updateApplicationSchema.parse({ ...body });

    // buscar aplicação existente
    const application = await db.application.findUnique({
      where: { id, companyId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Aplicação não encontrada" },
        { status: 404 },
      );
    }

    // buscar estoque
    const stock = await db.productStock.findUnique({
      where: { id: data.productStockId },
    });

    if (!stock) {
      return NextResponse.json(
        { error: "Estoque não encontrado" },
        { status: 404 },
      );
    }

    // calcular estoque corrigido (devolve a antiga e tira a nova)
    const adjustedStock = stock.stock + application.quantity - data.quantity;
    if (adjustedStock < 0) {
      return NextResponse.json(
        { error: "Estoque insuficiente para alteração." },
        { status: 400 },
      );
    }

    const [updated] = await db.$transaction([
      db.application.update({
        where: { id },
        data: {
          productStockId: data.productStockId,
          quantity: data.quantity,
          date: data.date,
          notes: data.notes,
          cycleId: data.cycleId,
          talhaoId: data.talhaoId,
        },
        include: {
          productStock: { include: { product: true, farm: true } },
          talhao: true,
        },
      }),
      db.productStock.update({
        where: { id: data.productStockId },
        data: { stock: adjustedStock },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar aplicação." },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/insumos/applications/{id}:
 *   delete:
 *     summary: Excluir aplicação de insumos
 *     tags:
 *       - Aplicação de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aplicação deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Aplicação não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const application = await db.application.findUnique({
      where: { id: params.id, companyId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Aplicação não encontrada" },
        { status: 404 },
      );
    }

    // recuperar estoque relacionado
    const stock = await db.productStock.findUnique({
      where: { id: application.productStockId },
    });

    if (!stock) {
      return NextResponse.json(
        { error: "Estoque não encontrado" },
        { status: 404 },
      );
    }

    await db.$transaction([
      db.application.delete({ where: { id: params.id } }),
      db.productStock.update({
        where: { id: application.productStockId },
        data: { stock: stock.stock + application.quantity },
      }),
    ]);

    return NextResponse.json({ message: "Aplicação removida com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar aplicação." },
      { status: 500 },
    );
  }
}
