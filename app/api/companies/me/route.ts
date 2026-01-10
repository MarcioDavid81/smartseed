import { getServerSession } from "@/lib/auth/get-server-session"
import { db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession()

  const company = await db.company.findUnique({
    where: { id: session?.user.companyId },
    select: {
      plan: true,
    },
  })

  return NextResponse.json(company)
}
