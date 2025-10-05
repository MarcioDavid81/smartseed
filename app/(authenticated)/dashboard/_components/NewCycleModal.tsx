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
import { PRODUCT_TYPE_OPTIONS } from "../../_constants/products";
import { ProductType } from "@prisma/client";

interface NewCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cycleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  productType: z.nativeEnum(ProductType),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
});

type CycleFormData = z.infer<typeof cycleSchema>;

const NewCycleModal = ({ isOpen, onClose }: NewCycleModalProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CycleFormData>({
    resolver: zodResolver(cycleSchema),
  });

  const onSubmit = async (data: CycleFormData) => {
    setLoading(true);

    const token = getToken();

    const res = await fetch("/api/cycles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao cadastrar safra.");
    } else {
      toast.success("Safra cadastrada com sucesso!");
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
          <DialogTitle>Nova Safra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                {...register("name")}
                placeholder="Ex: Soja 2025"
              />
              {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <div>
              <Label htmlFor="productType">Produto</Label>
              <select {...register("productType")} className="w-full border rounded p-2">
                <option value="">Selecione um produto</option>
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.productType && <span className="text-red-500">{errors.productType.message}</span>}
            </div>
            <div>
              <Label htmlFor="startDate">Início</Label>
              <Input
                {...register("startDate")}
                placeholder="Ex: 01/01/2025"
                type="date"
              />
              {errors.startDate && <span className="text-red-500">{errors.startDate.message}</span>}
            </div>
            <div>
              <Label htmlFor="endDate">Término</Label>
              <Input
                {...register("endDate")}
                placeholder="Ex: 31/12/2025"
                type="date"
              />
              {errors.endDate && <span className="text-red-500">{errors.endDate.message}</span>}
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

export default NewCycleModal;
