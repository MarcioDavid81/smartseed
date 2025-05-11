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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { Cultivar, Farm } from "@/types";
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
  farmId: z.string().min(1, "Selecione uma fazenda"),
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
  const [farms, setFarms] = useState<Farm[]>([]);

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(plantioSchema),
    defaultValues: {
      cultivarId: plantio?.cultivarId ?? "",
      farmId: plantio?.farmId ?? "",
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
      farmId: plantio?.farmId ?? "",
      date: plantio ? new Date(plantio.date).toISOString().split("T")[0] : "",
      quantityKg: plantio?.quantityKg ?? 0,
      notes: plantio?.notes ?? "",
    },
  });

  useEffect(() => {
    if (plantio) {
      reset({
        cultivarId: plantio.cultivarId,
        farmId: plantio.farmId,
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

      const [cultivarRes, farmRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/farms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const farmData = await farmRes.json();

      setCultivars(cultivarData);
      setFarms(farmData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: ConsumptionFormData) => {
    console.log(" 📦 Data enviada:", data);
    setLoading(true);
    const token = getToken();

    const url = plantio ? `/api/consumption/${plantio.id}` : "/api/consumption";
    const method = plantio ? "PUT" : "POST";

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
      toast.error(result.error || "Erro ao salvar plantio.");
    } else {
      toast.success(
        plantio
          ? "Plantio atualizada com sucesso!"
          : "Plantio cadastrada com sucesso!"
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
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {cultivars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {farms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
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
