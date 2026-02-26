import { ApiError } from "@/lib/http/api-error";
import { CycleStatus, Prisma } from "@prisma/client";

export async function assertCycleIsOpen(
  tx: Prisma.TransactionClient,
  cycleId: string,
  companyId: string
) {
  const cycle = await tx.productionCycle.findUnique({
    where: { id: cycleId, companyId },
    select: { status: true, name: true },
  });

  if (!cycle) {
    throw new ApiError("Safra não encontrada.", 404);
  }

  if (cycle.status === CycleStatus.CLOSED) {
    throw new ApiError(
      `A safra "${cycle.name}" está encerrada e não aceita novas movimentações.`,
      409
    );
  }
}