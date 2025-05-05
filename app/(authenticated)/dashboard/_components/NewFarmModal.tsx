"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getToken } from "@/lib/auth-client";
import { FaSpinner } from "react-icons/fa";

type NewFarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
};

const NewFarmModal = ({ isOpen, onClose, companyId }: NewFarmModalProps) => {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !area) {
      toast.warning("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      console.log({ name, area: Number(area), companyId });
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          name,
          area: parseFloat(area),
          companyId,
        }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar fazenda");

      toast.success("Fazenda cadastrada com sucesso!");
      setName("");
      setArea("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cadastrar fazenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Fazenda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fazenda Boa Esperança"
            />
          </div>

          <div>
            <Label htmlFor="area">Área (ha)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: 120"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green text-white"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmModal;
