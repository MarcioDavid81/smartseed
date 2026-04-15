import { SaleContractDomainService } from "@/core/domain/sale-contract/sale-contract-domain.service";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { saleContractSchema } from "@/lib/schemas/saleContractSchema";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const body = await req.json();

    const parsed = saleContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const { items, ...contractData } = parsed.data;

    const saleContract = await db.saleContract.findUnique({
      where: {
        id: params.id,
        companyId,
      },
      include: {
        items: true,
      },
    });

    if (!saleContract) {
      return NextResponse.json(
        { error: "Contrato de venda não encontrado" },
        { status: 404 },
      );
    }

    if (saleContract.items.length !== 1 || items.length !== 1) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STRUCTURE",
            message:
              "Alteração de volume permitida apenas para contratos com um único item.",
          },
        },
        { status: 400 },
      );
    }

    await db.$transaction(async (tx) => {
      // 🔹 Atualiza cabeçalho
      await tx.saleContract.update({
        where: { id: saleContract.id },
        data: contractData,
      });

      const existingItem = saleContract.items[0];
      const incomingItem = items[0];
      const newQuantity = new Prisma.Decimal(incomingItem.quantity);

      // 🔹 Regra empresarial: não pode reduzir abaixo do já atendido
      if (newQuantity.lt(existingItem.fulfilledQuantity)) {
        throw new Error("Novo volume não pode ser menor que o já atendido.");
      }

      // 🔹 Atualiza somente o volume e total
      await tx.saleContractItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newQuantity.mul(existingItem.unityPrice),
        },
      });
    });

    return NextResponse.json(
      { message: "Contrato de venda atualizado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Quantidade insuficiente em estoque para o item do contrato de venda"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CANNOT_UPDATE",
            title: "Atualização não permitida",
            message:
              "A quantidade solicitada para o item do contrato de venda excede a disponível em estoque.",
          },
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Novo volume não pode ser menor que o já atendido."
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_VOLUME",
            title: "Volume inválido",
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    console.error("Erro ao atualizar venda:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message: "Ocorreu um erro ao processar a solicitação.",
        },
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

    const saleContract = await db.saleContract.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!saleContract || saleContract.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Contrato de venda não encontrado ou não pertence à empresa do usuário",
          },
        },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      const canDelete = await SaleContractDomainService.canDeleteContract(
        tx,
        id,
      );

      if (!canDelete) {
        throw new Error(
          "Contrato de venda possui movimentações e não pode ser excluído",
        );
      }

      // 1️⃣ remove os itens primeiro
      await tx.saleContractItem.deleteMany({
        where: { saleContractId: id },
      });

      // 2️⃣ agora remove o contrato
      await tx.saleContract.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "Contrato de venda excluído com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Contrato de venda possui movimentações e não pode ser excluído"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CANNOT_DELETE",
            title: "Exclusão não permitida",
            message:
              "Não é possível excluir o contrato de venda pois existem movimentações vinculadas",
          },
        },
        { status: 409 },
      );
    }

    console.error("Erro ao excluir contrato de venda:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          title: "Erro interno do servidor",
          message:
            "Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.",
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

    const saleContract = await db.saleContract.findUnique({
      where: { id },
      include: {
        customer: true,
        member: true,
        memberAdress: true,
        items: {
          include: {
            industrySales: true,
            seedSales: true,
            cultivar: true,
          },
        },
      },
    });

    if (!saleContract || saleContract.companyId !== companyId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            title: "Recurso não encontrado",
            message:
              "Contrato de venda não encontrado ou não pertence à empresa do usuário",
          },
        },
        { status: 404 },
      );
    }

    const items = saleContract.items.map((item) => {
      const unitPrice = Number(item.unityPrice);

      const deliveries = [
        ...item.industrySales.map((sale) => {
          const quantity = Number(sale.weightLiq);
          const totalPrice = unitPrice * quantity;

          return {
            id: sale.id,
            date:
              sale.date instanceof Date
                ? sale.date.toISOString()
                : String(sale.date),
            invoice: String(sale.document ?? ""),
            quantity,
            unit: item.unit,
            totalPrice: Number.isFinite(totalPrice)
              ? Number(totalPrice.toFixed(2))
              : 0,
          };
        }),
        ...item.seedSales.map((sale) => {
          const quantity = Number(sale.quantityKg);
          const totalPrice = unitPrice * quantity;

          return {
            id: sale.id,
            date:
              sale.date instanceof Date
                ? sale.date.toISOString()
                : String(sale.date),
            invoice: String(sale.invoiceNumber ?? ""),
            quantity,
            unit: item.unit,
            totalPrice: Number.isFinite(totalPrice)
              ? Number(totalPrice.toFixed(2))
              : 0,
          };
        }),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return {
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        fulfilledQuantity: Number(item.fulfilledQuantity),
        remainingQuantity:
          Number(item.quantity) - Number(item.fulfilledQuantity),
        unit: item.unit,
        unityPrice: unitPrice,
        totalPrice: Number(item.totalPrice),
        product: item.product ? item.product : null,
        cultivar: item.cultivar
          ? { id: item.cultivar.id, name: item.cultivar.name }
          : null,
        deliveries,
      };
    });

    const deliveries = items
      .flatMap((item) => item.deliveries)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(
      {
        id: saleContract.id,
        type: saleContract.type,
        date: saleContract.date,
        document: saleContract.document,
        status: saleContract.status,
        notes: saleContract.notes,
        customerId: saleContract.customerId,

        customer: {
          id: saleContract.customer.id,
          name: saleContract.customer.name,
        },
        memberId: saleContract.memberId ?? null,
        member: {
          id: saleContract.member?.id ?? null,
          name: saleContract.member?.name ?? null,
          email: saleContract.member?.email ?? null,
          phone: saleContract.member?.phone ?? null,
          cpf: saleContract.member?.cpf ?? null,
        },
        memberAdressId: saleContract.memberAdressId ?? null,
        memberAdress: {
          id: saleContract.memberAdress?.id ?? null,
          stateRegistration: saleContract.memberAdress?.stateRegistration ?? null,
          zip: saleContract.memberAdress?.zip ?? null,
          adress: saleContract.memberAdress?.adress ?? null,
          number: saleContract.memberAdress?.number ?? null,
          complement: saleContract.memberAdress?.complement ?? null,
          district: saleContract.memberAdress?.district ?? null,
          state: saleContract.memberAdress?.state ?? null,
          city: saleContract.memberAdress?.city ?? null,
        },
        items,
        deliveries,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar contrato de venda:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          title: "Erro interno",
          message: "Erro interno no servidor",
        },
      },
      { status: 500 },
    );
  }
}
