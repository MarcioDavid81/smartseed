"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth-client";
import { FaSpinner } from "react-icons/fa";
import { AccountStatus } from "@prisma/client";

type Props = {
  accountReceivableId: string;
  status: AccountStatus;
};

export function EditReceivableStatusDialog({ accountReceivableId, status }: Props) {
  const [newStatus, setNewStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Token não encontrado");
      const res = await fetch(`/api/financial/receivables/${accountReceivableId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status");
      toast.success("Status atualizado com sucesso!");
      window.location.reload(); // ou mutate SWR, dependendo de como carrega os dados
    } catch (err) {
      toast.error("Erro ao atualizar status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Atualizar Status da Conta a Receber</DialogTitle>
      </DialogHeader>

      <RadioGroup
        value={newStatus}
        onValueChange={(value) =>
          setNewStatus(value as AccountStatus)
        }
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="PENDING" id="pending" />
          <label htmlFor="pending">Pendente</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="PAID" id="paid" />
          <label htmlFor="paid">Pago</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="OVERDUE" id="overdue" />
          <label htmlFor="overdue">Vencido</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="CANCELED" id="canceled" />
          <label htmlFor="canceled">Cancelado</label>
        </div>
      </RadioGroup>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={loading} className="w-full bg-green text-white">
          {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
