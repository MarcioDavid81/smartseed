import { adjustStockWhenDeleteMov } from "@/app/_helpers/adjustStockWhenDeleteMov";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Atualizar uma venda
 *     tags:
 *       - Venda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da venda
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantityKg:
 *                 type: number
 *               invoiceNumber:
 *                 type: string
 *               saleValue:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleExit'
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Venda não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
// Atualizar venda
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const {
      cultivarId,
      date,
      quantityKg,
      customerId,
      invoiceNumber,
      saleValue,
      notes,
    } = await req.json();

    // ✅ Tratamento de campos opcionais
    const parsedCustomerId =
      customerId && customerId !== "" ? customerId : null;
    const parsedInvoiceNumber =
      invoiceNumber && invoiceNumber !== "" ? invoiceNumber : null;
    const parsedSaleValue =
      saleValue && saleValue !== "" ? Number(saleValue) : null;
    const parsedNotes = notes && notes !== "" ? notes : null;

    // Buscar o venda para garantir que pertence à empresa do usuário
    const existing = await db.saleExit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Venda não encontrado ou acesso negado", {
        status: 403,
      });
    }

    // Se quantidade ou cultivar mudarem, ajustar o estoque
    if (
      existing.quantityKg !== quantityKg ||
      existing.cultivarId !== cultivarId
    ) {
      // Reverter estoque anterior
      await db.cultivar.update({
        where: { id: existing.cultivarId },
        data: {
          stock: {
            increment: existing.quantityKg,
          },
        },
      });

      // Subtrair nova quantidade ao novo cultivar
      await db.cultivar.update({
        where: { id: cultivarId },
        data: {
          stock: {
            decrement: quantityKg,
          },
        },
      });
    }

    // Atualizar estoque
    const updated = await db.saleExit.update({
      where: { id },
      data: {
        cultivarId,
        date: new Date(date),
        quantityKg: Number(quantityKg),
        customerId: parsedCustomerId,
        invoiceNumber: parsedInvoiceNumber,
        saleValue: parsedSaleValue,
        notes: parsedNotes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Deletar uma venda
 *     tags:
 *       - Venda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Venda deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaleExit'
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Venda não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */

// Deletar venda
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

    // Buscar o venda para garantir que pertence à empresa do usuário
    const existing = await db.saleExit.findUnique({ where: { id } });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Venda não encontrado ou acesso negado", {
        status: 403,
      });
    }

    await adjustStockWhenDeleteMov(
      "venda",
      existing.cultivarId,
      existing.quantityKg
    );

    const deleted = await db.saleExit.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Erro ao deletar venda:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Buscar venda
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

    // Buscar o venda para garantir que pertence à empresa do usuário
    const venda = await db.saleExit.findUnique({ where: { id } });

    if (!venda || venda.companyId !== payload.companyId) {
      return new NextResponse("Venda não encontrado ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(venda);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
