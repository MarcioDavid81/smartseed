import { validateStock } from "@/app/_helpers/validateStock";
import {
  ForbiddenPlanError,
  PlanLimitReachedError,
} from "@/core/access-control";
import { withAccessControl } from "@/lib/api/with-access-control";
import { requireAuth } from "@/lib/auth/require-auth";
import { canCompanyAddBeneficiation } from "@/lib/permissions/canCompanyAddBeneficiation";
import { db } from "@/lib/prisma";
import { beneficiationSchema } from "@/lib/schemas/seedBeneficiationSchema";
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
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const session = await withAccessControl("REGISTER_MOVEMENT");

    const body = await req.json();

    const parsed = beneficiationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const stockValidation = await validateStock(
      data.cultivarId,
      data.quantityKg,
    );
    if (stockValidation) return stockValidation;

    const cultivar = await db.cultivar.findUnique({
      where: { id: data.cultivarId },
      select: { id: true, name: true, product: true },
    });

    if (!cultivar) {
      return NextResponse.json(
        { error: "Cultivar não encontrada" },
        { status: 404 },
      );
    }

    // 🔄 Tudo dentro de uma transação para garantir integridade
    const result = await db.$transaction(async (tx) => {
      // 1️⃣ Cria o registro do beneficiamento
      const beneficiation = await tx.beneficiation.create({
        data: {
          ...data,
          companyId: session.user.companyId,
        },
      });

      // 2️⃣ Atualiza o estoque da cultivar (decrementa)
      await tx.cultivar.update({
        where: { id: data.cultivarId },
        data: {
          stock: { decrement: data.quantityKg },
        },
      });

      // 3️⃣ Incrementa o estoque no depósito industrial, se houver destino
      if (data.destinationId) {
        const existingIndustryStock = await tx.industryStock.findFirst({
          where: {
            companyId,
            product: cultivar.product,
            industryDepositId: data.destinationId,
          },
        });

        if (existingIndustryStock) {
          await tx.industryStock.update({
            where: { id: existingIndustryStock.id },
            data: {
              quantity: { increment: data.quantityKg },
            },
          });
        } else {
          await tx.industryStock.create({
            data: {
              companyId,
              product: cultivar.product,
              industryDepositId: data.destinationId,
              quantity: data.quantityKg,
            },
          });
        }
      }

      return beneficiation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar descarte:", error);
    if (error instanceof PlanLimitReachedError) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }

    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
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
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;
  const cycleId = req.nextUrl.searchParams.get("cycleId");

  try {
    const beneficiations = await db.beneficiation.findMany({
      where: { companyId, ...(cycleId && { cycleId }) },
      include: {
        cultivar: {
          select: { id: true, name: true, product: true },
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
