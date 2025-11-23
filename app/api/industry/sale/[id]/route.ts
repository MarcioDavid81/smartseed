import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AccountStatus, PaymentCondition, ProductType } from "@prisma/client";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

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
    const data = await req.json();
    const { companyId } = payload;

    const existing = await db.industrySale.findUnique({
      where: { id },
      include: { accountReceivable: true, industryDeposit: true },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Venda não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 🧮 Se mudar o depósito ou a quantidade, ajusta o estoque
    const quantityDiff = data.weightLiq - Number(existing.weightLiq);
    const depositChanged =
      data.industryDepositId !== existing.industryDepositId;

    await db.$transaction(async (tx) => {
      // Ajustar estoque antigo se mudou depósito
      if (depositChanged) {
        // Devolve quantidade ao depósito antigo
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: existing.industryDepositId,
            product: existing.product,
          },
          data: { quantity: { increment: Number(existing.weightLiq) } },
        });

        // Retira quantidade do novo depósito
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: data.industryDepositId,
            product: data.product,
          },
          data: { quantity: { decrement: Number(data.weightLiq) } },
        });
      } else if (quantityDiff !== 0) {
        // Ajusta estoque se só mudou a quantidade
        await tx.industryStock.updateMany({
          where: {
            industryDepositId: data.industryDepositId,
            product: data.product,
          },
          data: { quantity: { decrement: quantityDiff } }, // se positivo, diminui; se negativo, aumenta
        });
      }

      // Atualiza venda
      const updatedSale = await tx.industrySale.update({
        where: { id },
        data: {
          ...data,
          totalPrice: data.unitPrice * data.weightLiq,
        },
      });

      // Atualiza ou cria conta a receber
      if (data.paymentCondition === PaymentCondition.APRAZO && data.dueDate) {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId },
          select: { name: true },
        });

        const productLabel = data.product ?? existing.product
          .toString()
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l
          .toUpperCase());
        const document = data.document ?? existing.document ?? "S/NF";
        const customerName = customer?.name ?? "cliente";

        const description = `Venda de ${productLabel}, cfe NF ${document}, para ${customerName}`;


        if (existing.accountReceivable) {
          await tx.accountReceivable.update({
            where: { id: existing.accountReceivable.id },
            data: {
              description,
              amount: data.totalPrice,
              dueDate: new Date(data.dueDate),
            },
          });
        } else {
          await tx.accountReceivable.create({
            data: {
              description,
              amount: data.totalPrice,
              dueDate: new Date(data.dueDate),
              companyId,
              customerId: data.customerId,
              industrySaleId: updatedSale.id, // FK correta!
            },
          });
        }
      } else if (
        data.paymentCondition === PaymentCondition.AVISTA &&
        existing.accountReceivable
      ) {
        // Se passou pra à vista, remove o contas a receber existente
        await tx.accountReceivable.delete({
          where: { id: existing.accountReceivable.id },
        });
      }
    });

    return NextResponse.json({ message: "Venda atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;
    const { companyId } = payload;

    const sale = await db.industrySale.findUnique({
      where: { id },
      include: {
        customer: true,
        industryDeposit: true,
        industryTransporter: true,
        accountReceivable: true,
        cycle: true,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({
        error: {
          code: "TOKEN_MISSING",
          title: "Autenticação necessária",
          message: "Token ausente.",
        }
      },
      { status: 401 },
    );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_INVALID",
            title: "Token inválido",
            message: "Não foi possível validar suas credenciais.",
          },
        },
        { status: 401 },
      );
    }

    const { id } = params;
    const { companyId } = payload;

    const existing = await db.industrySale.findUnique({
      where: { id },
      include: {
        accountReceivable: true,
      },
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

    // 🚫 Impede exclusão de venda com conta já paga
    if (existing.accountReceivable?.status === AccountStatus.PAID) {
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

    await db.$transaction(async (tx) => {
      // 🔁 1. Reverte o estoque
      await tx.industryStock.updateMany({
        where: {
          industryDepositId: existing.industryDepositId,
          product: existing.product,
        },
        data: {
          quantity: { increment: Number(existing.weightLiq) },
        },
      });

      // 💰 2. Exclui o contas a receber, se existir
      if (existing.accountReceivable) {
        await tx.accountReceivable.delete({
          where: { id: existing.accountReceivable.id },
        });
      }

      // 🧾 3. Exclui a venda
      await tx.industrySale.delete({
        where: { id: existing.id },
      });
    });

    return NextResponse.json({ message: "Venda removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover venda:", error);
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
