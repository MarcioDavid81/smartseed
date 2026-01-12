import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     summary: Atualizar fazenda
 *     tags:
 *       - Fazenda
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               area:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fazenda atualizada com sucesso
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;

    const { id } = params;
    const { name } = await req.json();

    const existing = await db.farm.findUnique({ where: { id } });

    if (!existing || existing.companyId !== companyId) {
      return new NextResponse("Fazenda não encontrada ou acesso negado", {
        status: 403,
      });
    }

    const farm = await db.farm.update({
      where: { id, companyId },
      data: { name },
    });

    return NextResponse.json(farm, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar fazenda:", error);
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

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Deletar uma fazenda
 *     tags:
 *       - Fazenda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fazenda
 *     responses:
 *       200:
 *         description: Fazenda deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Fazenda não pertence à empresa do usuário
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { companyId } = auth;
    const { id } = params;

    const farmPlot = await db.talhao.findMany({
      where: { farmId: id, companyId },
    });

    if (farmPlot.length > 0) {
      return NextResponse.json(
        { 
          error: {
            code: "FARM_PLOT_ASSOCIATED",
            title: "Erro ao deletar fazenda",
            message: "Fazenda possui talhões associados",
          }
         },
        { status: 400 },
      );
    }

    await db.farm.delete({ where: { id, companyId } });

    return NextResponse.json(
      { 
        code: "FARM_DELETED",
        title: "Fazenda deletada com sucesso",
        message: "Fazenda deletada com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar fazenda:", error);
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
