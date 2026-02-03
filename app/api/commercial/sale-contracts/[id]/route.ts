import { SaleContractDomainService } from "@/core/domain/sale-contract/sale-contract-domain.service";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { saleContractSchema } from "@/lib/schemas/saleContractSchema";
import { ProductType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

    await db.$transaction(async (tx) => {
      // 🟢 atualiza cabeçalho
      await tx.saleContract.update({
        where: { id: saleContract.id },
        data: contractData,
      });

      // 🟢 remove itens antigos
      await tx.saleContractItem.deleteMany({
        where: { saleContractId: saleContract.id },
      });

      
      // 🟢 recria itens
      for (const item of items) {
        await SaleContractDomainService.validateItemCreate(
          tx,
          saleContract.id,
          item.quantity,
        );
        await tx.saleContractItem.create({
          data: {
            ...item,
            saleContractId: saleContract.id,
          },
        });
      }
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
              "A quantidade solicitada para o item do contrato de venda excede a disponível em estoque. Por favor, revise a quantidade e tente novamente.",
          },
        },
        { status: 409 },
      );
    }
    console.error("Erro ao atualizar venda:", error);
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
      const canDelete = await SaleContractDomainService.canDeleteContract(tx, id);

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
        items: {
          include: {
            industrySales: true,
            seedSales: true,
            cultivar: true,
          }
        }
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

    return NextResponse.json(saleContract, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar contrato de venda:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          title: "Erro interno",
          message: "Erro interno no servidor",
        }
      },
      { status: 500 },
    );
  }
}