import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const { name, email, adress, city, state, phone, cpf_cnpj } = await req.json();

    if (!name || !email || !adress || !city || !state || !phone || !cpf_cnpj) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const customer = await db.customer.create({
      data: {
        name,
        email,
        adress,
        city,
        state,
        phone,
        cpf_cnpj,
        companyId,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
    }
  
    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
  
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  
    const { companyId } = payload;
  
    try {
      const customer = await db.customer.findMany({
        where: { companyId },
        include: { sales: true },
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(customer, { status: 200 });
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  }
