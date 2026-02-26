"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSmartToast } from "@/contexts/ToastContext";
import { useChangeCycleStatus } from "@/queries/registrations/use-upsert-cycle-status";

type Props = {
  cycleId: string;
  initialStatus: "OPEN" | "CLOSED";
};

export function ChangeCycleStatus({ cycleId, initialStatus }: Props) {
  const { showToast } = useSmartToast();

  const mutation = useChangeCycleStatus({ cycleId });

  const checked = initialStatus === "CLOSED";

  function handleChange(value: boolean) {
    const newStatus = value ? "CLOSED" : "OPEN";

    mutation.mutate(newStatus, {
      onSuccess: (status) => {
        showToast({
          type: "success",
          title: "Status da Safra",
          message:
            status === "CLOSED"
              ? "Safra encerrada com sucesso."
              : "Safra reaberta com sucesso.",
        });
      },
      onError: (error: any) => {
        showToast({
          type: "error",
          title: "Erro ao alterar o status da Safra",
          message: error.message,
        });
      },
    });
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => handleChange(!!value)}
        disabled={mutation.isPending}
      />
      <Label>
        {checked ? (
          <div>
            <p className="text-sm">
              Safra Encerrada.
            </p>
            <span className="text-xs font-light text-muted-foreground">
              Não é possível incluir novos registros.
            </span>
          </div>
        ) : (
          <div>
            <p className="text-sm">
              Encerrar Safra?
            </p>
            <span className="text-xs font-light text-muted-foreground">
              Não será possível incluir novos registros.
            </span>
          </div>
        )}
      </Label>
    </div>
  );
}