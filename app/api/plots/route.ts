import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/plots:
 *   post:
 *     summary: Registrar novo talhão
 *     tags:
 *       - Talhão
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
 *               farmId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Talhão criado com sucesso
 */

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const { name, area, farmId } = await req.json();

    if (!name || !area || !farmId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    const plot = await db.talhao.create({
      data: {
        name,
        area,
        farmId,
        companyId,
      },
    });

    return NextResponse.json(plot, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar talhão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/plots:
 *   get:
 *     summary: Listar todas os talhões da empresa do usuário logado
 *     tags:
 *       - Talhão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de talhões retornada com sucesso
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
 *                   farmId:
 *                     type: string
 *                   farm:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const plots = await db.talhao.findMany({
      where: { companyId },
      include: { farm: { select: { id: true, name: true } } },
      orderBy: { farm: { name: "asc" } },
    });

    return NextResponse.json(plots, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar talhões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
