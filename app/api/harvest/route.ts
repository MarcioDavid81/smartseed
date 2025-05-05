import { NextResponse } from "next/server";
import { updateCultivarStock } from "@/services/updateCultivarStock";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      cultivarId,
      talhaoId,
      quantityKg,
      date,
      companyId,
      notes,
    } = await req.json();

    const harvest = await db.harvest.create({
      data: {
        cultivarId,
        talhaoId,
        companyId,
        quantityKg,
        date: new Date(date),
        notes,
      },
    });

    await updateCultivarStock(cultivarId);

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao registrar colheita" }, { status: 500 });
  }
}
