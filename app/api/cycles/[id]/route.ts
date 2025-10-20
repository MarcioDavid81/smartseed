import { verifyToken } from "@/lib/auth";
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
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new NextResponse("Token ausente", { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return new NextResponse("Token inválido", { status: 401 });

    const { id } = params;

    const safra = await db.productionCycle.findMany({
      where: { id: id },
      include: {
        talhoes: {
          include: {
            talhao: {
              select: {
                id: true,
                name: true,
                area: true,
              }
            }
          }
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
  const { id } = params;

  try {
    const { name, productType, startDate, endDate, talhoesIds } = await req.json();

    if (!name || !productType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // 1. Verifica se o ciclo existe
    const existingCycle = await db.productionCycle.findUnique({
      where: { id },
    });

    if (!existingCycle) {
      return NextResponse.json({ error: "Safra não encontrada" }, { status: 404 });
    }

    // 2. Atualiza os dados principais
    const updatedCycle = await db.productionCycle.update({
      where: { id },
      data: {
        name,
        productType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
      },
    });

    // 3. Atualiza relacionamentos com os talhões
    // Remove os relacionamentos antigos
    await db.cycleTalhao.deleteMany({
      where: { cycleId: id },
    });

    // Adiciona os novos relacionamentos
    if (talhoesIds && talhoesIds.length > 0) {
      await db.cycleTalhao.createMany({
        data: talhoesIds.map((talhaoId: string) => ({
          cycleId: id,
          talhaoId,
        })),
      });
    }

    // 4. Retorna a safra atualizada com os talhões relacionados
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

    return NextResponse.json(cycleWithTalhoes, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar safra:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
