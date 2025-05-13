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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { Cultivar, Harvest, Talhao } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertHarvestModalProps {
  colheita?: Harvest;
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
  onUpdated?: () => void;
}

const harvestSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  notes: z.string(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

const UpsertHarvestModal = ({
  colheita,
  isOpen,
  onClose,
  onHarvestCreated,
  onUpdated,
}: UpsertHarvestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      cultivarId: colheita?.cultivarId ?? "",
      talhaoId: colheita?.talhaoId ?? "",
      date: colheita ? new Date(colheita.date).toISOString().split("T")[0] : "",
      quantityKg: colheita?.quantityKg ?? 0,
      notes: colheita?.notes ?? "",
    },
  });

  useEffect(() => {
    if (colheita) {
      reset({
        cultivarId: colheita.cultivarId,
        talhaoId: colheita.talhaoId,
        date: new Date(colheita.date).toISOString().split("T")[0],
        quantityKg: colheita.quantityKg,
        notes: colheita.notes || "",
      });
    } else {
      reset();
    }
  }, [colheita, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, talhaoRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/plots", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const talhaoData = await talhaoRes.json();

      setCultivars(cultivarData);
      setTalhoes(talhaoData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: HarvestFormData) => {
    console.log(" 📦 Data enviada:",data);
    setLoading(true);
    const token = getToken();

    const url = colheita ? `/api/harvest/${colheita.id}` : "/api/harvest";
    const method = colheita ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar colheita.", {
            style: {
                backgroundColor: "#F0C531",
                color: "white",
              },
            icon: "❌",
        });
    } else {
      toast.success(
        colheita
          ? "Colheita atualizada com sucesso!"
          : "Colheita cadastrada com sucesso!", {
        style: {
            backgroundColor: "#63B926",
            color: "white",
        },
        icon: "✅",
    }
      );
      onClose();
      reset();
      if (onHarvestCreated) onHarvestCreated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Colheita</DialogTitle>
          <DialogDescription>
            {colheita ? "Editar colheita" : "Cadastrar colheita"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div>
              <Label>Cultivar</Label>
              <select
                {...register("cultivarId")}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Selecione</option>
                {cultivars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.cultivarId && (
                <span className="text-xs text-red-500">
                  {errors.cultivarId.message}
                </span>
              )}
            </div>

            <div>
              <Label>Talhão</Label>
              <select
                {...register("talhaoId")}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Selecione</option>
                {talhoes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.talhaoId && (
                <span className="text-xs text-red-500">
                  {errors.talhaoId.message}
                </span>
              )}
            </div>

            <div>
              <Label>Data</Label>
              <Input type="date" {...register("date")} />
            </div>

            <div>
              <Label>Quantidade (kg)</Label>
              <Input
                type="number"
                {...register("quantityKg")}
                placeholder="Ex: 1200"
              />
              {errors.quantityKg && (
                <span className="text-xs text-red-500">
                  {errors.quantityKg.message}
                </span>
              )}
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea {...register("notes")} placeholder="Opcional" />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-white mt-4"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertHarvestModal;
