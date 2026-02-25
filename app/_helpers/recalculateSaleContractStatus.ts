import { ComercialStatus, Prisma } from "@prisma/client";

export async function recalcSaleContractStatus(
  tx: Prisma.TransactionClient,
  saleContractId: string
) {
  const items = await tx.saleContractItem.findMany({
    where: { saleContractId },
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

  await tx.saleContract.update({
    where: { id: saleContractId },
    data: { status: newStatus },
  });
}