import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { fuelTankSchema } from "@/lib/schemas/fuelTankSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: {
      code: "UNAUTHORIZED",
      title: "Autenticação necessária",
      message: "Token ausente.",
    } 
  },
   { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: {
      code: "TOKEN_INVALID",
      title: "Token inválido",
      message: "O token fornecido é inválido ou expirado.",
    } 
  },
    { status: 401 });
  }

  const { companyId } = payload;

  try {
    const body = await req.json();

    const parsed = fuelTankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: {
          code: "INVALID_DATA",
          title: "Dados inválidos",
          message: `${parsed.error.flatten().fieldErrors}`,
        } 
      },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const fuelTank = await db.fuelTank.create({
      data: {
        ...data,
        companyId,
      },
    });
    
    return NextResponse.json(fuelTank, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tanque de combustível:", error);
    return NextResponse.json({ error: {
      code: "CREATE_FUEL_TANK_ERROR",
      title: "Erro ao criar tanque de combustível",
      message: "Ocorreu um erro ao criar o tanque de combustível. Por favor, tente novamente.",
    }
   },
    { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: {
      code: "UNAUTHORIZED",
      title: "Autenticação necessária",
      message: "Token ausente.",
    } 
  },
   { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: {
      code: "TOKEN_INVALID",
      title: "Token inválido",
      message: "O token fornecido é inválido ou expirado.",
    } 
  },
    { status: 401 });
  }

  const { companyId } = payload;

  try {
    const fuelTanks = await db.fuelTank.findMany({
      where: {
        companyId,
      },
      include: {
        purchases: true,
        refuels: true,
      }
    });

    return NextResponse.json(fuelTanks);
  } catch (error) {
    console.error("Erro ao buscar tanques de combustível:", error);
    return NextResponse.json({ error: {
      code: "GET_FUEL_TANKS_ERROR",
      title: "Erro ao buscar tanques de combustível",
      message: "Ocorreu um erro ao buscar os tanques de combustível. Por favor, tente novamente.",
    } 
  },
   { status: 500 });
  }
}