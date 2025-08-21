import { z } from "zod";
import { ProductClass, Unit } from "@prisma/client";
import { canCompanyAddProduct } from "@/lib/permissions/canCompanyAddProduct";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";

/**
 * @swagger
 * /api/insumos/products:
 *   post:
 *     summary: Registrar nova insumo
 *     tags:
 *       - Cadastro de Insumos
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
 *               description:
 *                 type: string
 *               class:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Insumo criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Limite de registros atingido para seu plano
 *       404:
 *         description: Usuário ou empresa não encontrada
 *       409:
 *         description: Produto já cadastrado para esta empresa
 *       500:
 *         description: Erro interno do servidor
 */

const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  class: z.nativeEnum(ProductClass),
  unit: z.nativeEnum(Unit),
});

export async function POST(req: Request) {
  const allowed = await canCompanyAddProduct();
  if (!allowed) {
    return Response.json(
      {
        error:
          "Limite de registros atingido para seu plano. Faça upgrade para continuar.",
      },
      { status: 403 },
    );
  }

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

  const { userId, companyId } = payload;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!user || !user.companyId) {
    return NextResponse.json(
      { error: "Usuário ou empresa não encontrada" },
      { status: 404 },
    );
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: `Dados inválidos: ${errors}` },
        { status: 400 }
      );
    }

  const { name, description, class: productClass, unit } = parsed.data;
  try {
    const existingProduct = await db.product.findFirst({
      where: {
        name,
        companyId
      }
    });
    if (existingProduct) {
          return NextResponse.json(
            { error: "Produto já cadastrado para esta empresa" },
            { status: 409 }
          );
        }

    const newProduct = await db.product.create({
      data: {
        name,
        description,
        class: productClass,
        unit,
        companyId
      }
    });
    return NextResponse.json(newProduct, { status: 201 });

  }catch(err){
    console.error("Erro ao cadastrar produto", err);
    return NextResponse.json(
      { error: "Erro ao cadastrar produto" },
      { status: 500 }
    );
  }

}

/**
 * @swagger
 * /api/insumos/products:
 *   get:
 *     summary: Listar todos os insumos da empresa do usuário logado
 *     tags:
 *       - Cadastro de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de insumos retornada com sucesso
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
 *                   description:
 *                     type: string
 *                   class:
 *                     type: string
 *                   unit:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */

export async function GET(req: Request) {
  try {
      const authHeader = req.headers.get("authorization");
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Token ausente" }, { status: 401 });
      }
  
      const token = authHeader.split(" ")[1];
      const payload = await verifyToken(token);
  
      if (!payload || !payload.companyId) {
        return NextResponse.json(
          { error: "Token inválido ou sem companyId" },
          { status: 401 }
        );
      }

      const products = await db.product.findMany({
        where: {
          companyId: payload.companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(products);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
}
