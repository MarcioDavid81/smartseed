import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { Cultivar, Harvest, Talhao } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
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

  const form = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      cultivarId: colheita?.cultivarId ?? "",
      talhaoId: colheita?.talhaoId ?? "",
      date: colheita ? new Date(colheita.date).toISOString().split("T")[0] : "",
      quantityKg: colheita?.quantityKg ?? 0,
      notes: colheita?.notes ?? "",
    },
  });

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
      const cycle = getCycle();
      if (!cycle || !cycle.productType) {
        toast.error("Nenhum ciclo de produção selecionado.");
        return;
      }

      const [cultivarRes, talhaoRes] = await Promise.all([
        fetch(`/api/cultivars/available-for-harvest?productType=${cycle.productType as ProductType}`, {
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
    const cycle = getCycle();
    if (!cycle || !cycle.id) {
      toast.error("Nenhum ciclo de produção selecionado.");
      setLoading(false);
      return;
    }
    const cycleId = cycle.id;
    console.log("Dados enviados para API:", {
      ...data,
      cycleId,
    });

    const url = colheita ? `/api/harvest/${colheita.id}` : "/api/harvest";
    const method = colheita ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        cycleId,
      }),
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
          : "Colheita cadastrada com sucesso!",
        {
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
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Colheita</DialogTitle>
          <DialogDescription>
            {colheita ? "Editar colheita" : "Cadastrar colheita"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="cultivarId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Cultivar</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cultivar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cultivars.map((cultivar) => (
                          <SelectItem key={cultivar.id} value={cultivar.id}>
                            <div className="flex items-center gap-2">
                              <span>{cultivar.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {`Estoque: ${cultivar.stock} kg`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="talhaoId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Talhão</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um talhão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {talhoes.map((talhao) => (
                          <SelectItem key={talhao.id} value={talhao.id}>
                            <div className="flex items-center gap-2">
                              <span>{talhao.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {talhao.farm.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantityKg"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Quantidade (kg)</FormLabel>
                  <Input type="number" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <Textarea {...field} placeholder="Opcional" />
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-white mt-4"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertHarvestModal;
