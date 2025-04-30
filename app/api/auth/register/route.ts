import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password, companyName } = await req.json();
  if (!name || !email || !password || !companyName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }
    const hashedPassword = await hash(password, 10);
    const company = await db.company.create({
      data: {
        name: companyName,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
          },
        },
      },
    });
    return NextResponse.json({ success: true, companyId: company.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}