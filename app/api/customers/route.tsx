import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Registrar novo cliente
 *     tags:
 *       - Cliente
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
 *               email:
 *                 type: string
 *               adress:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               phone:
 *                 type: string
 *               cpf_cnpj:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente criado com sucesso
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { companyId } = payload;

  try {
    const { name, email, adress, city, state, phone, cpf_cnpj } = await req.json();

    if (!name || !email || !adress || !city || !state || !phone || !cpf_cnpj) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const customer = await db.customer.create({
      data: {
        name,
        email,
        adress,
        city,
        state,
        phone,
        cpf_cnpj,
        companyId,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Listar todas os clientes da empresa do usuário logado
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
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
 *                   email:
 *                     type: string
 *                   adress:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   cpf_cnpj:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não enviado ou mal formatado" }, { status: 401 });
    }
  
    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
  
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  
    const { companyId } = payload;
  
    try {
      const customer = await db.customer.findMany({
        where: { companyId },
        include: { sales: true },
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(customer, { status: 200 });
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  }
