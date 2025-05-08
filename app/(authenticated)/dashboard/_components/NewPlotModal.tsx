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
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { Farm } from "@/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/auth-client";

interface NewPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plotSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  area: z.number().min(1, "Area é obrigatória"),
  farmId: z.string().min(1, "Fazenda é obrigatória"), 
})

type PlotFormData = z.infer<typeof plotSchema>;

const NewPlotModal = ({ isOpen, onClose }: NewPlotModalProps) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<PlotFormData>({
      resolver: zodResolver(plotSchema),
    });

  async function fetchFarms() {
    const token = getToken();
    const res = await fetch("/api/farms", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFarms(data);
  }

  const onSubmit = async (data: PlotFormData) => {
    setLoading(true);
    const token = getToken();
    const res = await fetch("/api/plots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao cadastrar talhão.");
    } else {
      toast.success("Talhão cadastrada com sucesso!");
      onClose();
      reset();
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!isOpen) reset();
    fetchFarms();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Talhão</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                placeholder="Nome do talhão"
                {...register("name")}
              />
              {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input
                placeholder="Área em hectares"
                {...register("area", { valueAsNumber: true })}
              />
              {errors.area && <span className="text-red-500">{errors.area.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="farmId">Fazenda</Label>
              <select
                className="border rounded p-2"
                {...register("farmId")}
              >
                <option value="">Selecione uma fazenda</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
              {errors.farmId && <span className="text-red-500">{errors.farmId.message}</span>}
            </div>
          </div>
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-green text-white"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlotModal;
