import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";
import { Farm, Talhao } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";

interface UpsertPlotModalProps {
  talhao?: Talhao;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const plotSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  area: z.number().min(1, "Área do talhão é obrigatória"),
  farmId: z.string().min(1, "Fazenda é obrigatória"), 
});

type PlotFormData = z.infer<typeof plotSchema>;

const UpsertPlotModal = ({
  talhao,
  isOpen,
  onClose,
  onUpdated,
}: UpsertPlotModalProps) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(false);
  const { showToast } = useSmartToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlotFormData>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      name: talhao?.name ?? "",
      area: talhao?.area ?? 0,
      farmId: talhao?.farmId ?? "",
    },
  });

  useEffect(() => {
    if (talhao) {
      reset({
        name: talhao.name,
        area: talhao.area,
        farmId: talhao.farmId,
      });
    } else {
      reset();
    }
  }, [talhao, isOpen, reset]);

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
    if (!token) {
      showToast({
        type: "error",
        title: "Erro!",
        message: "Por favor, faça login para continuar.",
      });
      setLoading(false);
      return;
    }

    const url = talhao
      ? `/api/plots/${talhao.id}`
      : "/api/plots";
    const method = talhao ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      showToast({
        type: "error",
        title: result.title || "Erro ao salvar talhão.",
        message: result.message || "Ocorreu um erro ao salvar o talhão. Por favor, tente novamente.",
      });
    } else {
      showToast({
        type: "success",
        title: "Sucesso!",
        message: talhao
          ? "Talhão atualizado com sucesso!"
          : "Talhão cadastrado com sucesso!",
      });
      onClose();
      reset();
      if (onUpdated) onUpdated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
    fetchFarms();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Talhões</DialogTitle>
          <DialogDescription>
            {talhao ? "Editar talhão" : "Cadastrar talhão"}
          </DialogDescription>
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
                <option value="" className=" text-md font-light">Selecione uma fazenda</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id} className="font-light">
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

export default UpsertPlotModal;
