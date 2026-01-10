import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-server-session";
import { Plan } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await db.company.findUnique({
    where: { id: session.user.companyId },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // ❌ já é premium
  if (company.plan === Plan.PREMIUM) {
    return NextResponse.json(
      { error: "Plano já ativo" },
      { status: 400 }
    );
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.APP_URL}/assinaturas/success`,
    cancel_url: `${process.env.APP_URL}/assinaturas`,
    metadata: {
      companyId: company.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
