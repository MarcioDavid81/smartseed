import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { customerSchema } from "@/lib/schemas/customerSchema";
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

    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await db.customer.findUnique({ where: { id } });

    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou não pertence à empresa" },
        { status: 404 },
      );
    }

    const updated = await db.customer.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Excluir cliente
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    // Verifica se o cliente pertence à empresa
    const existing = await db.customer.findFirst({
      where: { id: params.id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou não pertence à empresa" },
        { status: 404 },
      );
    }

    // Consulta vínculos que impedem deleção
    const [
      buySeedCount, // compras de sementes
      saleSeedCount, // vendas de sementes
      purchaseInsumoCount, // compras de insumos
      industrySaleCount, // vendas de grão indústria
      payableCount, // contas a pagar
      receivableCount, // contas a receber
      purchaseFuellCount, // compras de combustíveis
    ] = await Promise.all([
      db.buy.count({ where: { customerId: params.id, companyId } }),
      db.purchase.count({ where: { customerId: params.id, companyId } }),
      db.saleExit.count({ where: { customerId: params.id, companyId } }),
      db.industrySale.count({ where: { customerId: params.id, companyId } }),
      db.accountPayable.count({ where: { customerId: params.id, companyId } }),
      db.accountReceivable.count({
        where: { customerId: params.id, companyId },
      }),
      db.fuelPurchase.count({ where: { customerId: params.id, companyId } }),
    ]);

    const blockers = [];
    if (buySeedCount > 0) blockers.push("compras de sementes");
    if (purchaseInsumoCount > 0) blockers.push("compras de insumos");
    if (saleSeedCount > 0) blockers.push("vendas de sementes");
    if (industrySaleCount > 0) blockers.push("vendas de indústria");
    if (payableCount > 0) blockers.push("contas a pagar");
    if (receivableCount > 0) blockers.push("contas a receber");
    if (purchaseFuellCount > 0) blockers.push("compras de combustíveis");

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cliente não pode ser deletado. Existem vínculos que impedem a remoção.",
          details: blockers,
        },
        { status: 409 },
      );
    }

    // Deleta o cliente
    await db.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
