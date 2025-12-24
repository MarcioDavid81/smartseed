import { verifyToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/cycles:
 *   get:
 *     summary: Listar uma safra pelo ID
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safra retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;

    const safra = await db.productionCycle.findMany({
      where: { id: id, companyId: companyId },
      include: {
        talhoes: {
          include: {
            talhao: {
              select: {
                id: true,
                name: true,
                area: true,
              },
            },
          },
        },
        industryHarvests: true,
      },
    });

    return NextResponse.json(safra);
  } catch (error) {
    console.error("Erro ao buscar safra:", error);
    return NextResponse.json("Erro interno no servidor", { status: 500 });
  }
}

/**
 * @swagger
 * /api/cycles/{id}:
 *   put:
 *     summary: Atualizar uma safra pelo ID
 *     tags:
 *       - Safra
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Safra atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *       401:
 *         description: Token ausente ou inválido
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  const { id } = params;

  try {
    const { name, productType, startDate, endDate, talhoesIds } =
      await req.json();

    if (!name || !productType || !startDate || !endDate) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            title: "Campos obrigatórios não informados",
            message: "Campos obrigatórios não informados",
          },
        },
        { status: 400 },
      );
    }

    // 1. Verifica se o ciclo existe
    const existingCycle = await db.productionCycle.findUnique({
      where: { id, companyId },
    });

    if (!existingCycle) {
      return NextResponse.json(
        { error: "Safra não encontrada" },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      await tx.productionCycle.update({
        where: { id },
        data: {
          name,
          productType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      await tx.cycleTalhao.deleteMany({
        where: { cycleId: id },
      });

      if (Array.isArray(talhoesIds) && talhoesIds.length > 0) {
        await tx.cycleTalhao.createMany({
          data: talhoesIds.map((talhaoId: string) => ({
            cycleId: id,
            talhaoId,
          })),
        });
      }
    });

    const cycleWithTalhoes = await db.productionCycle.findUnique({
      where: { id },
      include: {
        talhoes: {
          include: {
            talhao: true,
          },
        },
      },
    });

    return NextResponse.json(cycleWithTalhoes);
  } catch (error) {
    console.error("Erro ao atualizar safra:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar a safra",
        },
      },
      { status: 500 },
    );
  }
}
