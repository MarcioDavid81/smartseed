"use client";

import { QuantityInput } from "@/components/inputs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { ApiError } from "@/lib/http/api-error";
import { ConsumptionFormData, consumptionSchema } from "@/lib/schemas/seedConsumption";
import { useUpsertSeedConsumption } from "@/queries/seed/use-upsert-seed-consumption";
import { Cultivar, Talhao } from "@/types";
import { Consumption } from "@/types/consumption";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface UpsertConsumptionModalProps {
  plantio?: Consumption;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertConsumptionModal = ({
  plantio,
  isOpen,
  onClose,
}: UpsertConsumptionModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [talhao, setTalhao] = useState<Talhao[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      cultivarId: plantio?.cultivarId ?? "",
      talhaoId: plantio?.talhaoId ?? "",
      date: plantio ? new Date(plantio.date) : new Date(),
      quantityKg: plantio?.quantityKg ?? 0,
      notes: plantio?.notes ?? "",
    },
  });

  useEffect(() => {
    if (plantio) {
      form.reset({
        cultivarId: plantio.cultivarId,
        talhaoId: plantio.talhaoId,
        date: new Date(plantio.date),
        quantityKg: plantio.quantityKg,
        notes: plantio.notes || "",
      });
    } else {
      form.reset();
    }
  }, [plantio, isOpen, form.reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const cycle = getCycle();
      if (!cycle || !cycle.productType) {
        toast.error("Nenhum ciclo de produção selecionado.");
        return;
      }
      
      const [cultivarRes, talhaoRes] = await Promise.all([
        fetch(`/api/cultivars/available-for-planting?productType=${cycle.productType as ProductType}`, {
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

  const cycle = getCycle();

  const { mutate, isPending } = useUpsertSeedConsumption({ 
    cycleId: cycle?.id!, 
    consumptionId: plantio?.id
  });

  const onSubmit = async (data: ConsumptionFormData) => {
    if (!cycle?.id) {
    showToast({
      type: "error",
      title: "Erro",
      message: "Nenhum ciclo de produção selecionado.",
    });
    return;
  }
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: plantio ? 
          "Plantio atualizado com sucesso" : 
          "Plantio cadastrado com sucesso",
        });
        onClose();
        form.reset();
      },
      onError: (error: Error) => {
        if (error instanceof ApiError) {
          if (error.status === 402) {
            showToast({
              type: "info",
              title: "Limite atingido",
              message: error.message,
            });
            return;
          }
            
        if (error.status === 401) {
          showToast({
            type: "info",
            title: "Sessão expirada",
            message: "Faça login novamente",
          });
          return;
        }

        if (error.status === 409) {
          showToast({
            type: "info",
            title: "Safra finalizada",
            message: error.message,
          });
          return;
        }
      }
      showToast({
        type: "error",
        title: "Erro",
        message: error.message,
      });
      },
    });
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form.reset]);

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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} suffix=" kg" />
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
                      <Input {...field} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-green text-white mt-4"
              >
                {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertConsumptionModal;
