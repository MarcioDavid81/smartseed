import { ComercialStatus, Prisma } from "@prisma/client";

export async function recalcPurchaseOrderStatus(
  tx: Prisma.TransactionClient,
  purchaseOrderId: string
) {
  const items = await tx.purchaseOrderItem.findMany({
    where: { purchaseOrderId },
    select: {
      quantity: true,
      fulfilledQuantity: true,
    },
  });

  const totalContracted = items.reduce(
    (acc, i) => acc + Number(i.quantity),
    0
  );

  const totalFulfilled = items.reduce(
    (acc, i) => acc + Number(i.fulfilledQuantity),
    0
  );

  let newStatus: ComercialStatus = "OPEN";

  if (totalFulfilled === 0) {
    newStatus = "OPEN";
  } else if (totalFulfilled < totalContracted) {
    newStatus = "PARTIAL_FULFILLED";
  } else {
    newStatus = "FULFILLED";
  }

  await tx.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: { status: newStatus },
  });
}