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

type Props = {
  cultivarId: string;
  currentStatus: "BENEFICIANDO" | "BENEFICIADO";
};

export function EditCultivarStatusDialog({ cultivarId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`/api/cultivars/${cultivarId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
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
        <DialogTitle>Atualizar Status da Cultivar</DialogTitle>
      </DialogHeader>

      <RadioGroup
        value={status}
        onValueChange={(value) =>
          setStatus(value as "BENEFICIANDO" | "BENEFICIADO")
        }
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="BENEFICIANDO" id="beneficiando" />
          <label htmlFor="beneficiando">Beneficiando</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="BENEFICIADO" id="beneficiado" />
          <label htmlFor="beneficiado">Beneficiado</label>
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
