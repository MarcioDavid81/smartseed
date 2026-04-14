import { recalcSaleContractStatus } from "@/app/_helpers/recalculateSaleContractStatus";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { AccountStatus, PaymentCondition } from "@prisma/client";
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
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const body = await req.json();
    const {
      cultivarId,
      date,
      quantityKg,
      customerId,
      memberId,
      memberAdressId,
      invoiceNumber,
      saleValue,
      notes,
      paymentCondition,
      dueDate,
    } = body;

    const parsedCustomerId = customerId && customerId !== "" ? customerId : null;
    const parsedMemberId = memberId && memberId !== "" ? memberId : null;
    const parsedMemberAdressId =
      memberAdressId && memberAdressId !== "" ? memberAdressId : null;
    const parsedInvoiceNumber =
      invoiceNumber && invoiceNumber !== "" ? invoiceNumber : null;
    const parsedSaleValue =
      saleValue && saleValue !== "" ? Number(saleValue) : null;
    const parsedNotes = notes && notes !== "" ? notes : null;

    const parsedQuantityKg = Number(quantityKg);
    if (!Number.isFinite(parsedQuantityKg)) {
      return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: "Vencimento inválido" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const sale = await tx.saleExit.findUnique({
        where: { id },
        include: {
          saleContractItem: {
            include: {
              saleContract: true,
            },
          },
          accountReceivable: true,
        },
      });

      if (!sale || sale.companyId !== companyId) {
        return NextResponse.json(
          {
            error: {
              code: "SALE_NOT_FOUND",
              title: "Venda não encontrada",
              message:
                "A venda não foi localizada ou você não tem permissão para acessá-la.",
            },
          },
          { status: 403 },
        );
      }

      const delta = parsedQuantityKg - Number(sale.quantityKg);
      if (delta !== 0 || cultivarId !== sale.cultivarId) {
        // devolve estoque antigo
        await tx.cultivar.update({
          where: { id: sale.cultivarId },
          data: { stock: { increment: sale.quantityKg } },
        });

        // adiciona novo
        await tx.cultivar.update({
          where: { id: cultivarId },
          data: { stock: { decrement: parsedQuantityKg } },
        });
      }

      if (sale.saleContractItemId && sale.saleContractItem) {
        const item = sale.saleContractItem;

        const nextFulfilled = Number(item.fulfilledQuantity) + delta;
        if (nextFulfilled > Number(item.quantity)) {
          throw new Error("Quantidade excede o saldo do contrato");
        }

        await tx.saleContractItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              increment: delta,
            },
          },
        });

        await recalcSaleContractStatus(tx, item.saleContractId);
      }

      const updatedSale = await tx.saleExit.update({
        where: { id },
        data: {
          cultivarId,
          date: parsedDate,
          quantityKg: parsedQuantityKg,
          customerId: parsedCustomerId,
          memberId: parsedMemberId,
          memberAdressId: parsedMemberAdressId,
          invoiceNumber: parsedInvoiceNumber,
          saleValue: parsedSaleValue,
          notes: parsedNotes,
          paymentCondition,
          dueDate: parsedDueDate,
        },
      });

      if (paymentCondition === PaymentCondition.APRAZO && parsedDueDate) {
        if (!parsedCustomerId) {
          throw new Error("Cliente é obrigatório para pagamento a prazo");
        }
        if (!parsedSaleValue || !Number.isFinite(parsedSaleValue)) {
          throw new Error("Valor de venda inválido para pagamento a prazo");
        }

        const [cultivar, customer, member] = await Promise.all([
          tx.cultivar.findUnique({
            where: { id: cultivarId },
            select: { name: true },
          }),
          tx.customer.findUnique({
            where: { id: parsedCustomerId },
            select: { name: true },
          }),
          parsedMemberId
            ? tx.member.findUnique({
                where: { id: parsedMemberId },
                select: { name: true, email: true, phone: true, cpf: true },
              })
            : Promise.resolve(null),
        ]);

        const description = `Venda de ${cultivar?.name ?? "semente"}, cfe NF ${parsedInvoiceNumber ?? "S/NF"}, para ${customer?.name ?? "cliente"}, em nome de ${member?.name ?? "socio"}`;

        if (sale.accountReceivable) {
          await tx.accountReceivable.update({
            where: { id: sale.accountReceivable.id },
            data: {
              description,
              amount: parsedSaleValue,
              dueDate: parsedDueDate,
              customerId: parsedCustomerId,
              memberId: parsedMemberId,
              memberAdressId: parsedMemberAdressId,
            },
          });
        } else {
          await tx.accountReceivable.create({
            data: {
              description,
              amount: parsedSaleValue,
              dueDate: parsedDueDate,
              companyId: sale.companyId,
              customerId: parsedCustomerId,
              memberId: parsedMemberId,
              memberAdressId: parsedMemberAdressId,
              saleExitId: updatedSale.id,
            },
          });
        }
      } else {
        if (sale.accountReceivable) {
          await tx.accountReceivable.delete({
            where: { id: sale.accountReceivable.id },
          });
        }
      }

      return updatedSale;
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao atualizar venda:", error);

    if (error?.message === "SALE_NOT_FOUND") {
      return NextResponse.json(
        {
          error: {
            code: "SALE_NOT_FOUND",
            title: "Venda não encontrada",
            message:
              "A venda não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
      { status: 500 },
    );
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
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o venda para garantir que pertence à empresa do usuário
    const existingSale = await db.saleExit.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existingSale || existingSale.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "SALE_NOT_FOUND",
            title: "Venda não encontrada",
            message:
              "A venda não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    await db.$transaction(async (tx) => {
      const sale = await tx.saleExit.findUnique({
        where: { id },
        include: {
          accountReceivable: true,
          saleContractItem: {
            include: {
              saleContract: true,
            },
          },
        }
      });

      if (!sale || sale.companyId !== companyId) {
        throw new Error("SALE_NOT_FOUND");
      }

    // 🚫 Impede exclusão de venda com conta já paga
    if (sale.accountReceivable?.status === AccountStatus.PAID) {
      return NextResponse.json(
        {
          error: {
            code: "SALE_ALREADY_PAID",
            title: "Ação não permitida",
            message:
              "Não é possível excluir uma venda que já possui pagamento confirmado.",
          },
        },
        { status: 400 },
      );
    }

      // 1️⃣ Reverter estoque
      await tx.cultivar.update({
        where: { id: sale.cultivarId },
        data: {
          stock: {
            increment: sale.quantityKg,
          },
        },
      });

      // 2️⃣ Remover conta financeira
      if (sale.accountReceivable) {
        await tx.accountReceivable.delete({
          where: { id: sale.accountReceivable.id },
        });
      }

      // 3️⃣ Reverter atendimento do contrato
      if (sale.saleContractItemId && sale.saleContractItem) {
        const item = sale.saleContractItem;

        if (Number(item.fulfilledQuantity) < sale.quantityKg) {
          throw new Error("INVALID_FULFILLED_QUANTITY_REVERT");
        }

        await tx.saleContractItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              decrement: sale.quantityKg,
            },
          },
        });

        // 🔥 RECALCULAR STATUS DO CONTRATO
        await recalcSaleContractStatus(tx, item.saleContractId);
      }

      // 4️⃣  Deletar a remessa
      await tx.saleExit.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar venda:", error);

    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
      { status: 500 },
    );
  }
}

// Buscar venda
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    // Buscar o venda para garantir que pertence à empresa do usuário
    const venda = await db.saleExit.findUnique({
      where: { id },
      include: {
        customer: true,
        member: true,
        memberAdress: true,
        cultivar: true,
        accountReceivable: true,
      },
    });

    if (!venda || venda.companyId !== companyId) {
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
