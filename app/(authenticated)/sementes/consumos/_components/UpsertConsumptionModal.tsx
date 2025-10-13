"use client";

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
import { Cultivar, Talhao } from "@/types";
import { Consumption } from "@/types/consumption";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertConsumptionModalProps {
  plantio?: Consumption;
  isOpen: boolean;
  onClose: () => void;
  onConsumptionCreated?: () => void;
  onUpdated?: () => void;
}

const plantioSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  talhaoId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  notes: z.string(),
});

type ConsumptionFormData = z.infer<typeof plantioSchema>;

const UpsertConsumptionModal = ({
  plantio,
  isOpen,
  onClose,
  onConsumptionCreated,
  onUpdated,
}: UpsertConsumptionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [talhao, setTalhao] = useState<Talhao[]>([]);

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(plantioSchema),
    defaultValues: {
      cultivarId: plantio?.cultivarId ?? "",
      talhaoId: plantio?.talhaoId ?? "",
      date: plantio
        ? new Date(plantio.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      quantityKg: plantio?.quantityKg ?? 0,
      notes: plantio?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsumptionFormData>({
    resolver: zodResolver(plantioSchema),
    defaultValues: {
      cultivarId: plantio?.cultivarId ?? "",
      talhaoId: plantio?.talhaoId ?? "",
      date: plantio ? new Date(plantio.date).toISOString().split("T")[0] : "",
      quantityKg: plantio?.quantityKg ?? 0,
      notes: plantio?.notes ?? "",
    },
  });

  useEffect(() => {
    if (plantio) {
      reset({
        cultivarId: plantio.cultivarId,
        talhaoId: plantio.talhaoId,
        date: new Date(plantio.date).toISOString().split("T")[0],
        quantityKg: plantio.quantityKg,
        notes: plantio.notes || "",
      });
    } else {
      reset();
    }
  }, [plantio, isOpen, reset]);

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

      const [cultivarData, talhaoData] = await Promise.all([
        cultivarRes.json(),
        talhaoRes.json(),
      ]);

      setCultivars(cultivarData);
      setTalhao(talhaoData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: ConsumptionFormData) => {
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

    const url = plantio ? `/api/consumption/${plantio.id}` : "/api/consumption";
    const method = plantio ? "PUT" : "POST";

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
      toast.warning(result.error || "Erro ao salvar plantio.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        plantio
          ? "Plantio atualizada com sucesso!"
          : "Plantio cadastrada com sucesso!",
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
      if (onConsumptionCreated) onConsumptionCreated();
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
          <DialogTitle>Plantio</DialogTitle>
          <DialogDescription>
            {plantio ? "Editar plantio" : "Cadastrar plantio"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="cultivarId"
                render={({ field }) => (
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talhão</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um talhão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {talhao.map((talhao) => (
                              <SelectItem key={talhao.id} value={talhao.id}>
                                <div className="flex items-center gap-2">
                                  <span>{talhao.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {`Fazenda: ${talhao.farm.name}`}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade (Kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-white mt-4"
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertConsumptionModal;
