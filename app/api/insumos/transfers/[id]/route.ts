import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

/**
 * @swagger
 * /api/insumos/transfers/{id}:
 *   put:
 *     summary: Atualizar transferência de insumos
 *     tags:
 *       - Transferência de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               originFarmId:
 *                 type: string
 *               destFarmId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferência de insumo editada com sucesso
 */
const updateTransferSchema = z.object({
  date: z.coerce.date(),
  productId: z.string().cuid(),
  quantity: z.number().positive(),
  originFarmId: z.string().uuid(),
  destFarmId: z.string().uuid(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não informado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;

    const body = await req.json();
    const parsed = updateTransferSchema.parse(body);

    if (parsed.originFarmId === parsed.destFarmId) {
      return NextResponse.json(
        { error: "A fazenda de origem e destino devem ser diferentes." },
        { status: 400 }
      );
    }

    // Busca transferência original
    const existing = await db.transferExit.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Transferência não encontrada para esta empresa." },
        { status: 404 }
      );
    }

    // Transação: estorna + aplica nova movimentação
    const updatedTransfer = await db.$transaction(async (tx) => {
      // 1. Estornar saldo anterior
      const prevOriginStock = await tx.productStock.findUnique({
        where: {
          productId_farmId: {
            productId: existing.productId,
            farmId: existing.originFarmId,
          },
        },
      });

      const prevDestStock = await tx.productStock.findUnique({
        where: {
          productId_farmId: {
            productId: existing.productId,
            farmId: existing.destFarmId,
          },
        },
      });

      if (!prevOriginStock || !prevDestStock) {
        throw new Error("Estoques anteriores não encontrados para estorno.");
      }

      await tx.productStock.update({
        where: { id: prevOriginStock.id },
        data: { stock: { increment: existing.quantity } },
      });

      await tx.productStock.update({
        where: { id: prevDestStock.id },
        data: { stock: { decrement: existing.quantity } },
      });

      // 2. Buscar ou criar estoques novos (para os novos farms)
      const newOriginStock =
        (await tx.productStock.findUnique({
          where: {
            productId_farmId: {
              productId: parsed.productId,
              farmId: parsed.originFarmId,
            },
          },
        })) ??
        (await tx.productStock.create({
          data: {
            productId: parsed.productId,
            farmId: parsed.originFarmId,
            companyId,
            stock: 0,
          },
        }));

      const newDestStock =
        (await tx.productStock.findUnique({
          where: {
            productId_farmId: {
              productId: parsed.productId,
              farmId: parsed.destFarmId,
            },
          },
        })) ??
        (await tx.productStock.create({
          data: {
            productId: parsed.productId,
            farmId: parsed.destFarmId,
            companyId,
            stock: 0,
          },
        }));

      if (newOriginStock.stock < parsed.quantity) {
        throw new Error("Estoque insuficiente na nova fazenda de origem.");
      }

      // 3. Aplicar movimentação nova
      await tx.productStock.update({
        where: { id: newOriginStock.id },
        data: { stock: { decrement: parsed.quantity } },
      });

      await tx.productStock.update({
        where: { id: newDestStock.id },
        data: { stock: { increment: parsed.quantity } },
      });

      // 4. Atualizar registro da transferência
      return tx.transferExit.update({
        where: { id: params.id },
        data: {
          date: parsed.date,
          productId: parsed.productId,
          quantity: parsed.quantity,
          originFarmId: parsed.originFarmId,
          destFarmId: parsed.destFarmId,
          companyId,
        },
        include: {
          product: { select: { id: true, name: true, unit: true } },
          originFarm: { select: { id: true, name: true } },
          destFarm: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json(updatedTransfer, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/insumos/transfers/{id}:
 *   delete:
 *     summary: Excluir transferência de insumos
 *     tags:
 *       - Transferência de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transferência deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Transferência não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não informado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { companyId } = payload;

    // busca transferência existente
    const existing = await db.transferExit.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Transferência não encontrada para esta empresa." },
        { status: 404 }
      );
    }

    // transação: estornar e deletar
    await db.$transaction(async (tx) => {
      const originStock = await tx.productStock.findUnique({
        where: {
          productId_farmId: {
            productId: existing.productId,
            farmId: existing.originFarmId,
          },
        },
      });

      const destStock = await tx.productStock.findUnique({
        where: {
          productId_farmId: {
            productId: existing.productId,
            farmId: existing.destFarmId,
          },
        },
      });

      if (!originStock || !destStock) {
        throw new Error("Estoques não encontrados para estorno.");
      }

      // estorna operação
      await tx.productStock.update({
        where: { id: originStock.id },
        data: { stock: { increment: existing.quantity } },
      });

      await tx.productStock.update({
        where: { id: destStock.id },
        data: { stock: { decrement: existing.quantity } },
      });

      // deleta registro da transferência
      await tx.transferExit.delete({
        where: { id: existing.id },
      });
    });

    return NextResponse.json(
      { message: "Transferência removida com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
