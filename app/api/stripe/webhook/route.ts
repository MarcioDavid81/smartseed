import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";
import { Plan, SubscriptionStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * ✔ Checkout finalizado com sucesso
       * Aqui o plano PREMIUM nasce
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const companyId = session.metadata?.companyId;
        const customerId = session.customer as string | null;
        const subscriptionId = session.subscription as string | null;

        if (!companyId || !customerId || !subscriptionId) {
          console.warn("⚠️ checkout.session.completed sem dados essenciais");
          break;
        }

        await db.company.update({
          where: { id: companyId },
          data: {
            plan: Plan.PREMIUM,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          },
        });

        break;
      }

      /**
       * ❌ Assinatura cancelada (portal ou API)
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await db.company.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: Plan.BASIC,
            subscriptionStatus: SubscriptionStatus.CANCELED,
            stripeSubscriptionId: null,
          },
        });

        break;
      }
    }
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
