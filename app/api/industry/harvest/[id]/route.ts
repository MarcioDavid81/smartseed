import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
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


    // 🔎 Verifica se a colheita existe e pertence à empresa
    const existing = await db.industryHarvest.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== payload.companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 🔄 Vamos determinar os alvos finais de depósito, produto e peso
    // com base nos dados enviados e no estado atual.
    // Em seguida, ajustaremos o estoque de acordo.
    const stockChanges = [] as Array<ReturnType<typeof db.industryStock.updateMany> | ReturnType<typeof db.industryStock.upsert>>;

    // 🧠 Busca o produto do ciclo, se um novo ciclo foi fornecido; caso contrário, usa o produto atual
    let productToUse: ProductType = existing.product;
    if (data.cycleId && data.cycleId !== existing.cycleId) {
      const cycle = await db.productionCycle.findFirst({
        where: {
          id: data.cycleId,
          companyId, // segurança extra
        },
        select: {
          productType: true,
        },
      });

      if (!cycle) {
        return NextResponse.json(
          { error: "Ciclo não encontrado ou não pertence à empresa" },
          { status: 404 },
        );
      }

      productToUse = cycle.productType as ProductType;
    }

    const depositToUse = data.industryDepositId ?? existing.industryDepositId;
    const weightToUse = (data.weightLiq ?? existing.weightLiq)?.toString
      ? Number(existing.weightLiq.toString())
      : (data.weightLiq ?? existing.weightLiq);

    const depositChanged = depositToUse !== existing.industryDepositId;
    const productChanged = productToUse !== existing.product;

    // Se depósito ou produto mudou, ajusta estoques antigo e novo
    if (depositChanged || productChanged) {
      stockChanges.push(
        db.industryStock.updateMany({
          where: {
            companyId: payload.companyId,
            industryDepositId: existing.industryDepositId,
            product: existing.product,
          },
          data: {
            quantity: {
              decrement: existing.weightLiq,
            },
          },
        }),
      );

      stockChanges.push(
        db.industryStock.upsert({
          where: {
            product_industryDepositId: {
              product: productToUse,
              industryDepositId: depositToUse,
            },
          },
          update: {
            quantity: { increment: weightToUse },
          },
          create: {
            companyId: payload.companyId,
            product: productToUse,
            industryDepositId: depositToUse,
            quantity: weightToUse,
          },
        }),
      );
    } else if (typeof data.weightLiq !== "undefined" && data.weightLiq !== existing.weightLiq) {
      // Se só o peso mudou, ajusta o estoque no mesmo depósito
      const diff = (typeof data.weightLiq === "number"
        ? data.weightLiq
        : Number(data.weightLiq)) - existing.weightLiq.toNumber();
      stockChanges.push(
        db.industryStock.updateMany({
          where: {
            companyId: payload.companyId,
            industryDepositId: existing.industryDepositId,
            product: existing.product,
          },
          data: {
            quantity: { increment: diff },
          },
        }),
      );
    }

    // 🧩 Atualiza a colheita e o estoque numa transação
    const updateData: any = {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
      product: productToUse, // produto sempre definido aqui
    };

    const [updated] = await db.$transaction([
      db.industryHarvest.update({
        where: { id },
        data: updateData,
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

    const existing = await db.industryHarvest.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "HARVEST_NOT_FOUND",
            title: "Colheita não encontrada",
            message:
              "A colheita não foi localizada ou você não tem permissão para acessá-la.",
          },
        },
        { status: 403 },
      );
    }

    // 1️⃣ Buscar estoque atual
    const stock = await db.industryStock.findUnique({
      where: {
        product_industryDepositId: {
          product: existing.product,
          industryDepositId: existing.industryDepositId,
        },
      },
    });

    if (stock) {
      const currentQuantity = stock.quantity.toNumber();
      const harvestWeight = existing.weightLiq?.toNumber() ?? 0;

      // 2️⃣ Subtrair peso da colheita que será deletada
      const newQuantity = Math.max(currentQuantity - harvestWeight, 0);

      await db.industryStock.update({
        where: {
          product_industryDepositId: {
            product: existing.product,
            industryDepositId: existing.industryDepositId,
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
    return NextResponse.json(
      {
        error: {
          code: "HARVEST_DELETE_ERROR",
          title: "Erro ao deletar colheita",
          message: 
          "Ocorreu um erro inesperado durante a tentativa de remover a colheita.",
        }
      },
      { status: 500 },
    );
  }
}
