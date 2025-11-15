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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, area } = await req.json();
    const { id } = params;

    const farm = await db.farm.update({
      where: { id },
      data: { name, area },
    });

    return NextResponse.json(farm, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
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
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await db.farm.delete({ where: { id } });

    return NextResponse.json({ message: "Fazenda deletada com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
