import { z } from "zod";
import { ProductClass, Unit } from "@prisma/client";
import { canCompanyAddProduct } from "@/lib/permissions/canCompanyAddProduct";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { inputProductSchema } from "@/lib/schemas/inputSchema";
import { requireAuth } from "@/lib/auth/require-auth";
import { withAccessControl } from "@/lib/api/with-access-control";
import { assertCompanyPlanAccess } from "@/core/plans/assert-company-plan-access";
import { ForbiddenPlanError, PlanLimitReachedError } from "@/core/access-control";

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
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    const session = await withAccessControl("CREATE_MASTER_DATA");

    await assertCompanyPlanAccess({
      companyId: session.user.companyId,
      action: "CREATE_MASTER_DATA",
    });

    const body = await req.json();

    const parsed = inputProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            title: "Dados inválidos",
            message: `${parsed.error.flatten().fieldErrors}`,
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const newProduct = await db.product.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    if (error instanceof PlanLimitReachedError) {
          return NextResponse.json(
            { message: error.message },
            { status: 402 }
          )
        }
        
    if (error instanceof ForbiddenPlanError) {
      return NextResponse.json(
        { message: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json({ error: {
      code: "CREATE_PRODUCT_ERROR",
      title: "Erro ao criar produto",
      message: "Ocorreu um erro ao criar o produto. Por favor, tente novamente.",
    }
   },
    { status: 500 });
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
        { status: 401 },
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
      { status: 500 },
    );
  }
}
