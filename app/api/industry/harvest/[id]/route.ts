import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
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
    const data = await req.json();

    // 🔎 Verifica se a colheita existe e pertence à empresa
    const existing = await db.industryHarvest.findUnique({
      where: { id },
    });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Colheita não encontrada ou acesso negado", {
        status: 403,
      });
    }

    // 🔄 Vamos determinar os alvos finais de depósito, produto e peso
    // com base nos dados enviados e no estado atual.
    // Em seguida, ajustaremos o estoque de acordo.
    const stockChanges = [] as Array<
      | ReturnType<typeof db.industryStock.updateMany>
      | ReturnType<typeof db.industryStock.upsert>
    >;

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
            companyId: companyId,
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
            companyId: companyId,
            product: productToUse,
            industryDepositId: depositToUse,
            quantity: weightToUse,
          },
        }),
      );
    } else if (
      typeof data.weightLiq !== "undefined" &&
      data.weightLiq !== existing.weightLiq
    ) {
      // Se só o peso mudou, ajusta o estoque no mesmo depósito
      const diff =
        (typeof data.weightLiq === "number"
          ? data.weightLiq
          : Number(data.weightLiq)) - existing.weightLiq.toNumber();
      stockChanges.push(
        db.industryStock.updateMany({
          where: {
            companyId: companyId,
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
    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        title: "Erro interno no servidor",
        message: 'Ocorreu um erro ao processar a solicitação, por favor, tente novamente mais tarde.'
      }
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

    const currentQuantity = Number(stock?.quantity ?? 0);
    const harvestWeight = Number(existing.weightLiq ?? 0);

    // 🚫 2️⃣ Impedir estoque negativo
    if (harvestWeight > currentQuantity) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_STOCK",
            title: "Estoque insuficiente",
            message: `A colheita possui ${harvestWeight} kg, e o estoque atual é de ${currentQuantity} kg. A exclusão deixaria o estoque negativo.`,
          },
        },
        { status: 400 },
      );
    }

    // 3️⃣ Recalcular o estoque
    if (stock) {
      await db.industryStock.update({
        where: {
          product_industryDepositId: {
            product: existing.product,
            industryDepositId: existing.industryDepositId,
          },
        },
        data: {
          quantity: currentQuantity - harvestWeight,
        },
      });
    }

    // 4️⃣ Excluir a colheita
    await db.industryHarvest.delete({ where: { id } });

    return NextResponse.json(
      { message: "Colheita removida com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar colheita:", error);
    return NextResponse.json(
      {
        error: {
          code: "HARVEST_DELETE_ERROR",
          title: "Erro ao deletar colheita",
          message:
            "Ocorreu um erro inesperado durante a tentativa de remover a colheita.",
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

    const existing = await db.industryHarvest.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true,
          },
        },
        talhao: {
          select: {
            name: true,
            farm: {
              select: {
                name: true,
              },
            },
          },
        },
        industryDeposit: {
          select: {
            name: true,
          },
        },
        industryTransporter: {
          select: {
            name: true,
            cpf_cnpj: true,
            city: true,
            state: true,
            phone: true,
          },
        },
      },
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

    return NextResponse.json(existing, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar colheita:", error);
    return NextResponse.json(
      {
        error: {
          code: "HARVEST_FETCH_ERROR",
          title: "Erro ao buscar colheita",
          message:
            "Ocorreu um erro inesperado durante a tentativa de buscar a colheita.",
        },
      },
      { status: 500 },
    );
  }
}
