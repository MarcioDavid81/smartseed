import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/beneficiation/{id}:
 *   put:
 *     summary: Atualizar um descarte
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do descarte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantityKg:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Descarte atualizada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Descarte não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Atualizar descarte
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { cultivarId, date, quantityKg, notes, destinationId } = await req.json();

    if (!cultivarId || !date || !quantityKg || !destinationId) {
      return new NextResponse("Campos obrigatórios faltando", { status: 400 });
    }

    const existing = await db.beneficiation.findUnique({
      where: { id },
      include: {
        cultivar: true,
        destination: true,
      },
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Beneficiamento não encontrado ou acesso negado", {
        status: 403,
      });
    }

    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Reverter estoque anterior da cultivar, se quantidade ou cultivar mudaram
      if (existing.cultivarId !== cultivarId || existing.quantityKg !== quantityKg) {
        await tx.cultivar.update({
          where: { id: existing.cultivarId },
          data: { stock: { increment: existing.quantityKg } },
        });

        const newCultivar = await tx.cultivar.findUnique({ where: { id: cultivarId } });
        if (!newCultivar) throw new Error("Cultivar destino não encontrada");

        if (newCultivar.stock < quantityKg) {
          throw new Error("Estoque insuficiente na cultivar selecionada");
        }

        await tx.cultivar.update({
          where: { id: cultivarId },
          data: { stock: { decrement: quantityKg } },
        });
      }

      // 2️⃣ Ajustar depósito de destino
      const productType = existing.cultivar.product; // 🔧 defina conforme a categoria do beneficiamento

      // Se o destino mudou
      if (existing.destinationId !== destinationId) {
        if (existing.destinationId) {
          await tx.industryStock.updateMany({
            where: {
              industryDepositId: existing.destinationId,
              companyId: payload.companyId,
              product: productType,
            },
            data: { quantity: { decrement: existing.quantityKg } },
          });
        }

        await tx.industryStock.upsert({
          where: {
            product_industryDepositId: {
              product: productType,
              industryDepositId: destinationId,
            },
          },
          update: { quantity: { increment: quantityKg } },
          create: {
            product: productType,
            industryDepositId: destinationId,
            companyId: payload.companyId,
            quantity: quantityKg,
          },
        });
      } else if (existing.quantityKg !== quantityKg) {
        // Mesmo depósito, mas alterou o peso
        const diff = quantityKg - existing.quantityKg;
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: existing.destinationId!,
            companyId: payload.companyId,
            product: productType,
          },
          data: { quantity: { increment: diff } },
        });
      }

      // 3️⃣ Atualizar o beneficiamento
      const updated = await tx.beneficiation.update({
        where: { id },
        data: {
          cultivarId,
          date: new Date(date),
          quantityKg,
          notes,
          destinationId,
        },
      });

      return updated;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar beneficiamento:", error);
    const message = error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


/**
 * @swagger
 * /api/beneficiation/{id}:
 *   delete:
 *     summary: Deletar um descarte
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do descarte
 *     responses:
 *       200:
 *         description: Descarte deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Descarte não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Deletar descarte
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Busca o beneficiamento com informações completas
    const existing = await db.beneficiation.findUnique({
      where: { id },
      include: {
        cultivar: true,
        destination: true,
      },
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    await db.$transaction(async (tx) => {
      // 1️⃣ Reverter estoque da cultivar (incrementar)
      await tx.cultivar.update({
        where: { id: existing.cultivarId },
        data: {
          stock: {
            increment: existing.quantityKg,
          },
        },
      });

      // 2️⃣ Reverter estoque do depósito industrial, se houver destino
      if (existing.destinationId) {
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: existing.destinationId,
            companyId: payload.companyId,
            product: existing.cultivar.product,
          },
          data: {
            quantity: {
              decrement: existing.quantityKg,
            },
          },
        });
      }

      // 3️⃣ Excluir o beneficiamento
      await tx.beneficiation.delete({ where: { id } });
    });

    return new NextResponse("Beneficiamento removido com sucesso", {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao deletar beneficiamento:", error);
    const message = error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Buscar descarte
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    // Buscar o descarte para garantir que pertence à empresa do usuário
    const descarte = await db.beneficiation.findUnique({ where: { id } });

    if (!descarte || descarte.companyId !== payload.companyId) {
      return new NextResponse("Descarte não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(descarte);
  } catch (error) {
    console.error("Erro ao buscar descarte:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
