import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Atualizar cliente (parcial)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const {
      name,
      email,
      adress,
      city,
      state,
      phone,
      cpf_cnpj,
    } = await req.json();

    // Verifica se o cliente pertence à empresa
    const existing = await db.customer.findFirst({
      where: { id: params.id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou não pertence à empresa" },
        { status: 404 }
      );
    }

    // Monta objeto apenas com campos enviados
    const dataToUpdate: Record<string, string> = {};
    if (typeof name === "string") dataToUpdate.name = name;
    if (typeof email === "string") dataToUpdate.email = email;
    if (typeof adress === "string") dataToUpdate.adress = adress;
    if (typeof city === "string") dataToUpdate.city = city;
    if (typeof state === "string") dataToUpdate.state = state;
    if (typeof phone === "string") dataToUpdate.phone = phone;
    if (typeof cpf_cnpj === "string") dataToUpdate.cpf_cnpj = cpf_cnpj;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    const updated = await db.customer.update({
      where: { id: params.id },
      data: dataToUpdate,
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
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    // Verifica se o cliente pertence à empresa
    const existing = await db.customer.findFirst({
      where: { id: params.id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou não pertence à empresa" },
        { status: 404 }
      );
    }

    // Consulta vínculos que impedem deleção
    const [
      buySeedCount,           // compras de sementes
      saleSeedCount,         // vendas de sementes
      purchaseInsumoCount,  // compras de insumos
      industrySaleCount,   // vendas de grão indústria
      payableCount,       // contas a pagar
      receivableCount,   // contas a receber
    ] = await Promise.all([
      db.buy.count({ where: { customerId: params.id, companyId } }),
      db.purchase.count({ where: { customerId: params.id, companyId } }),
      db.saleExit.count({ where: { customerId: params.id, companyId } }),
      db.industrySale.count({ where: { customerId: params.id, companyId } }),
      db.accountPayable.count({ where: { customerId: params.id, companyId } }),
      db.accountReceivable.count({ where: { customerId: params.id, companyId } }),
    ]);

    const blockers = [];
    if (buySeedCount > 0) blockers.push("compras de sementes");
    if (purchaseInsumoCount > 0) blockers.push("compras de insumos");
    if (saleSeedCount > 0) blockers.push("vendas de sementes");
    if (industrySaleCount > 0) blockers.push("vendas de indústria");
    if (payableCount > 0) blockers.push("contas a pagar");
    if (receivableCount > 0) blockers.push("contas a receber");

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cliente não pode ser deletado. Existem vínculos que impedem a remoção.",
          details: blockers,
        },
        { status: 409 }
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