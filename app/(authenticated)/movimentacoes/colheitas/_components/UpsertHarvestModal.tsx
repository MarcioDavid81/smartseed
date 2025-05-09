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
import { Cultivar, Talhao } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Harvest } from "@prisma/client";
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
}

const harvestSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  quantityKg: z.number().min(1, "Quantidade é obrigatória"),
  notes: z.string(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

const UpsertHarvestModal = ({
  colheita,
  isOpen,
  onClose,
  onHarvestCreated,
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
  });

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
    setLoading(true);
    const token = getToken();

    const res = await fetch("/api/harvest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao cadastrar colheita.");
    } else {
      toast.success("Colheita cadastrada com sucesso!");
      onClose();
      reset();
    }
    if (onHarvestCreated) onHarvestCreated();
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
          <DialogDescription>Insira os dados da colheita</DialogDescription>
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
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea {...register("notes")} placeholder="Opcional" />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-white"
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertHarvestModal;
