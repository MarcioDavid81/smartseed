import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
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

    // 🔎 Verifica se a colheita existe e pertence à empresa
    const existing = await db.industryHarvest.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 🔄 Caso o depósito ou o produto sejam alterados,
    // precisamos ajustar o estoque antigo e o novo.
    const stockChanges = [];

    // Se o depósito ou produto forem alterados
    const depositChanged =
      data.industryDepositId &&
      data.industryDepositId !== existing.industryDepositId;

    const productChanged =
      data.productId && data.productId !== existing.productId;

    // Se o depósito ou produto mudou, decrementa o estoque anterior
    if (depositChanged || productChanged) {
      stockChanges.push(
        db.industryStock.updateMany({
          where: {
            companyId: payload.companyId,
            industryDepositId: existing.industryDepositId,
            industryProductId: existing.productId,
          },
          data: {
            quantity: {
              decrement: existing.weightLiq,
            },
          },
        }),
      );

      // incrementa o novo estoque (ou cria se não existir)
      stockChanges.push(
        db.industryStock.upsert({
          where: {
            industryProductId_industryDepositId: {
              industryProductId: data.productId,
              industryDepositId: data.industryDepositId,
            },
          },
          update: {
            quantity: { increment: data.weightLiq },
          },
          create: {
            companyId: payload.companyId,
            industryProductId: data.productId,
            industryDepositId: data.industryDepositId,
            quantity: data.weightLiq,
          },
        }),
      );
    } else if (data.weightLiq && data.weightLiq !== existing.weightLiq) {
      // Se só o peso mudou, ajusta o estoque no mesmo depósito
      const diff = data.weightLiq - existing.weightLiq.toNumber();
      stockChanges.push(
        db.industryStock.updateMany({
          where: {
            companyId: payload.companyId,
            industryDepositId: existing.industryDepositId,
            industryProductId: existing.productId,
          },
          data: {
            quantity: { increment: diff },
          },
        }),
      );
    }

    // 🧩 Atualiza a colheita e o estoque numa transação
    const [updated] = await db.$transaction([
      db.industryHarvest.update({
        where: { id },
        data: {
          ...data,
          date: new Date(data.date),
        },
      }),
      ...stockChanges,
    ]);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar colheita:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
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

    const harvest = await db.industryHarvest.findUnique({
      where: { id },
    });

    if (!harvest || harvest.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 1️⃣ Buscar estoque atual
    const stock = await db.industryStock.findUnique({
      where: {
        industryProductId_industryDepositId: {
          industryProductId: harvest.productId,
          industryDepositId: harvest.industryDepositId,
        },
      },
    });

    if (stock) {
      const currentQuantity = stock.quantity.toNumber();
      const harvestWeight = harvest.weightLiq?.toNumber() ?? 0;

      // 2️⃣ Subtrair peso da colheita que será deletada
      const newQuantity = Math.max(currentQuantity - harvestWeight, 0);

      await db.industryStock.update({
        where: {
          industryProductId_industryDepositId: {
            industryProductId: harvest.productId,
            industryDepositId: harvest.industryDepositId,
          },
        },
        data: { quantity: newQuantity },
      });
    }

    // 3️⃣ Excluir a colheita
    await db.industryHarvest.delete({ where: { id } });

    return NextResponse.json({ message: "Colheita removida com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar colheita:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
