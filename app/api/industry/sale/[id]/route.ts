import { recalcSaleContractStatus } from "@/app/_helpers/recalculateSaleContractStatus";
import { industrySaleSchema } from "@/lib/schemas/industrySale";
import { requireAuth } from "@/lib/auth/require-auth";
import { ApiError } from "@/lib/http/api-error";
import { db } from "@/lib/prisma";
import { AccountStatus, PaymentCondition } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

    const parsed = industrySaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0]?.message ?? "Dados inválidos",
          },
        },
        { status: 400 },
      );
    }

    const data = {
      ...parsed.data,
      industryTransporterId: parsed.data.industryTransporterId?.trim() || null,
    };

    if (data.paymentCondition === PaymentCondition.APRAZO && !data.dueDate) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: "Vencimento é obrigatório para pagamento a prazo",
          },
        },
        { status: 400 },
      );
    }

    const existing = await db.industrySale.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existing || existing.companyId !== companyId) {
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
      const industrySale = await tx.industrySale.findUnique({
        where: { id },
        include: {
          saleContractItem: {
            include: {
              saleContract: true,
            },
          },
          accountReceivable: true,
          industryDeposit: true,
        },
      });

      if (!industrySale) throw new Error("Venda não encontrada");

      const product = data.product ?? industrySale.product;

      // 🧮 Se mudar o depósito ou a quantidade, ajusta o estoque
      const quantityDiff =
        Number(data.weightLiq) - Number(industrySale.weightLiq);
      const depositChanged =
        data.industryDepositId !== industrySale.industryDepositId;
      // Ajustar estoque antigo se mudou depósito
      if (depositChanged) {
        // Devolve quantidade ao depósito antigo
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: industrySale.industryDepositId,
            product,
          },
          data: { quantity: { increment: Number(industrySale.weightLiq) } },
        });

        // Retira quantidade do novo depósito
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: data.industryDepositId,
            product,
          },
          data: { quantity: { decrement: Number(data.weightLiq) } },
        });
      } else if (quantityDiff !== 0) {
        // Ajusta estoque se só mudou a quantidade
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: data.industryDepositId,
            product,
          },
          data: { quantity: { decrement: quantityDiff } }, // se positivo, diminui; se negativo, aumenta
        });
      }

      if (industrySale.saleContractItemId && industrySale.saleContractItem) {
        const item = industrySale.saleContractItem;

        const nextFulfilled = Number(item.fulfilledQuantity) + quantityDiff;
        if (nextFulfilled > Number(item.quantity)) {
          throw new Error("Quantidade excede o saldo do contrato");
        }

        await tx.saleContractItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              increment: quantityDiff,
            },
          },
        });

        await recalcSaleContractStatus(tx, item.saleContractId);
      }

      const totalPrice = Number(data.unitPrice) * Number(data.weightLiq);

      const updatedSale = await tx.industrySale.update({
        where: { id },
        data: {
          ...data,
          totalPrice,
        },
      });

      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        const [customer, member] = await Promise.all([
          tx.customer.findUnique({
            where: { id: data.customerId },
            select: { name: true },
          }),
          tx.member.findUnique({
            where: { id: data.memberId },
            select: { name: true, email: true, phone: true, cpf: true },
          }),
        ]);

        const productLabel =
          data.product ??
          industrySale.product
            .toString()
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
        const document = data.document ?? industrySale.document ?? "S/NF";
        const customerName = customer?.name ?? "cliente";
        const memberName = member?.name ?? "sócio";

        const description = `Venda de ${productLabel}, cfe NF ${document}, para ${customerName}, em nome de ${memberName}`;

        if (industrySale.accountReceivable) {
          await tx.accountReceivable.update({
            where: { id: industrySale.accountReceivable.id },
            data: {
              description,
              amount: totalPrice,
              dueDate: data.dueDate,
              customerId: data.customerId,
              memberId: data.memberId,
              memberAdressId: data.memberAdressId,
            },
          });
        } else {
          await tx.accountReceivable.create({
            data: {
              description,
              amount: totalPrice,
              dueDate: data.dueDate,
              companyId,
              customerId: data.customerId,
              memberId: data.memberId,
              memberAdressId: data.memberAdressId,
              industrySaleId: updatedSale.id,
            },
          });
        }
      } else if (
        data.paymentCondition === PaymentCondition.AVISTA &&
        industrySale.accountReceivable
      ) {
        // Se passou pra à vista, remove o contas a receber existente
        await tx.accountReceivable.delete({
          where: { id: industrySale.accountReceivable.id },
        });
      }
    });

    return NextResponse.json({ message: "Venda atualizada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao atualizar venda:", error);

    return NextResponse.json(
      {
        error: error.message ?? "Erro interno no servidor",
      },
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

    const existing = await db.industrySale.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existing || existing.companyId !== companyId) {
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
      const industrySale = await tx.industrySale.findUnique({
        where: { id },
        include: {
          accountReceivable: true,
          saleContractItem: {
            include: {
              saleContract: true,
            },
          },
        },
      });

      if (!industrySale) throw new Error("Venda não encontrada");

      // 🚫 Impede exclusão de venda com conta já paga
      if (industrySale.accountReceivable?.status === AccountStatus.PAID) {
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

      // 🔁 1. Reverte o estoque
      await tx.industryStock.updateMany({
        where: {
          industryDepositId: industrySale.industryDepositId,
          product: industrySale.product,
        },
        data: {
          quantity: { increment: Number(industrySale.weightLiq) },
        },
      });

      // 💰 2. Exclui o contas a receber, se existir
      if (industrySale.accountReceivable) {
        await tx.accountReceivable.delete({
          where: { id: industrySale.accountReceivable.id },
        });
      }

      // 3. Se for atendimento de contrato de compra, reverter a quantidade entregue
      if (industrySale.saleContractItemId && industrySale.saleContractItem) {
        const item = industrySale.saleContractItem;

        const fulfilled = Number(item.fulfilledQuantity);
        const weight = Number(industrySale.weightLiq);

        if (fulfilled < weight) {
          throw new Error(
            `Data integrity error: fulfilledQuantity (${fulfilled}) < weightLiq (${weight})`,
          );
        }

        await tx.saleContractItem.update({
          where: { id: item.id },
          data: {
            fulfilledQuantity: {
              decrement: industrySale.weightLiq,
            },
          },
        });

        // 🔥 RECALCULAR STATUS DO CONTRATO
        await recalcSaleContractStatus(tx, item.saleContractId);
      }

      // 🧾 4. Deletar Remessa
      await tx.industrySale.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao remover venda:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "DELETE_SALE_ERROR",
          title: "Erro ao remover venda",
          message:
            "Ocorreu um erro inesperado durante a tentativa de remover a venda.",
        },
      },
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

    const sale = await db.industrySale.findUnique({
      where: { id },
      include: {
        customer: true,
        member: true,
        memberAdress: true,
        industryDeposit: true,
        industryTransporter: true,
        accountReceivable: true,
      },
    });

    if (!sale || sale.companyId !== companyId) {
      return new NextResponse("Venda não encontrada ou acesso negado", {
        status: 403,
      });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar venda" },
      { status: 500 },
    );
  }
}
