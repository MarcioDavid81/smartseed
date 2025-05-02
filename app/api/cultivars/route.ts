import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";

const cultivarSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  product: z.enum([
    "SOJA",
    "TRIGO",
    "MILHO",
    "AVEIA_BRANCA",
    "AVEIA_PRETA",
    "AVEIA_UCRANIANA",
    "AZEVEM",
  ]),
});

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { userId, companyId } = payload;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!user || !user.companyId) {
    return NextResponse.json({ error: "Usuário ou empresa não encontrada" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = cultivarSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(", ");
    return NextResponse.json({ error: `Dados inválidos: ${errors}` }, { status: 400 });
  }

  const { name, product } = parsed.data;

  try {
    const existingCultivar = await db.cultivar.findFirst({
      where: {
        name,
        product,
        companyId,
      },
    });

    if (existingCultivar) {
      return NextResponse.json({ error: "Cultivar já cadastrada para esta empresa" }, { status: 409 });
    }

    const cultivar = await db.cultivar.create({
      data: {
        name,
        product,
        companyId,
      },
    });

    return NextResponse.json(cultivar, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar cultivar:", err);
    return NextResponse.json({ error: "Erro ao criar cultivar" }, { status: 500 });
  }
}
