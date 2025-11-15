import { verifyToken } from "@/lib/auth";
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
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

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
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Token não enviado ou mal formatado" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const plots = await db.talhao.findMany({
      where: { companyId },
      include: { farm: { select: { id: true, name: true } } },
      orderBy: { name: "desc" },
    });

    return NextResponse.json(plots, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar talhões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
