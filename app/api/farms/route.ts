import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Registrar nova fazenda
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
 *         description: Fazenda criada com sucesso
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { companyId } = auth;

  try {
    const { name, area } = await req.json();

    if (!name || !area) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    const farm = await db.farm.create({
      data: {
        name,
        area,
        companyId,
      },
    });

    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fazenda:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Listar todas as fazendas da empresa do usuário logado
 *     tags:
 *       - Fazenda
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas retornada com sucesso
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
 *                   talhoes:
 *                     type: array
 *                     items:
 *                       type: object
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
    const farms = await db.farm.findMany({
      where: { companyId },
      include: { talhoes: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(farms, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar fazendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
