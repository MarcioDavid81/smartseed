"use client";

import { useEffect, useState } from "react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface NewFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const farmSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  area: z.number().min(1, "Area é obrigatória"),
});

type FarmFormData = z.infer<typeof farmSchema>;

const NewFarmModal = ({ isOpen, onClose }: NewFarmModalProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
  });

  const onSubmit = async (data: FarmFormData) => {
    setLoading(true);

    const token = getToken();

    const res = await fetch("/api/farms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao cadastrar fazenda.");
    } else {
      toast.success("Fazenda cadastrada com sucesso!");
      onClose();
      reset();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Fazenda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                {...register("name")}
                placeholder="Ex: Fazenda Boa Esperança"
              />
              {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <div>
              <Label htmlFor="area">Área (ha)</Label>
              <Input
                {...register("area", { valueAsNumber: true })}
                placeholder="Ex: 120"
              />
              {errors.area && <span className="text-red-500">{errors.area.message}</span>}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-white"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmModal;
