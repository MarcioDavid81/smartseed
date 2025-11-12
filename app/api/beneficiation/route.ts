import { validateStock } from "@/app/_helpers/validateStock";
import { verifyToken } from "@/lib/auth";
import { canCompanyAddBeneficiation } from "@/lib/permissions/canCompanyAddBeneficiation";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/beneficiation:
 *   post:
 *     summary: Registrar novo descarte
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cultivarId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               quantityKg:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Descarte criado com sucesso
 */
export async function POST(req: NextRequest) {
  const allowed = await canCompanyAddBeneficiation();
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
      },
      { status: 403 }
    );
  }

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
      cultivarId,
      date,
      quantityKg,
      notes,
      cycleId,
      destinationId, // 🆕 novo campo
    } = await req.json();

    if (!cultivarId || !date || !quantityKg) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const stockValidation = await validateStock(cultivarId, quantityKg);
    if (stockValidation) return stockValidation;

    const cultivar = await db.cultivar.findUnique({
      where: { id: cultivarId },
      select: { id: true, name: true, product: true },
    });

    if (!cultivar) {
      return NextResponse.json(
        { error: "Cultivar não encontrada" },
        { status: 404 }
      );
    }

    // 🔄 Tudo dentro de uma transação para garantir integridade
    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o registro do beneficiamento
      const beneficiation = await tx.beneficiation.create({
        data: {
          cultivarId,
          date: new Date(date),
          quantityKg,
          notes,
          companyId,
          cycleId,
          destinationId, // salva o depósito de destino
        },
      });

      // 2️⃣ Atualiza o estoque da cultivar (decrementa)
      await tx.cultivar.update({
        where: { id: cultivarId },
        data: {
          stock: { decrement: quantityKg },
        },
      });

      // 3️⃣ Incrementa o estoque no depósito industrial, se houver destino
      if (destinationId) {
        const existingIndustryStock = await tx.industryStock.findFirst({
          where: {
            companyId,
            product: cultivar.product,
            industryDepositId: destinationId,
          },
        });

        if (existingIndustryStock) {
          await tx.industryStock.update({
            where: { id: existingIndustryStock.id },
            data: {
              quantity: { increment: quantityKg },
            },
          });
        } else {
          await tx.industryStock.create({
            data: {
              companyId,
              product: cultivar.product,
              industryDepositId: destinationId,
              quantity: quantityKg,
            },
          });
        }
      }

      return beneficiation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar descarte:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


/**
 * @swagger
 * /api/beneficiation:
 *   get:
 *     summary: Listar todos os descartes da empresa do usuário logado
 *     tags:
 *       - Descarte
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de descartes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   cultivarId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   quantityKg:
 *                     type: number
 *                   notes:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(req: NextRequest) {
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
  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const beneficiations = await db.beneficiation.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        cultivar: {
          select: { id: true, name: true },
        },
        destination: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(beneficiations, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar descartes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
