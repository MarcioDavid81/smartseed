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
import { SeedHarvestFormData, seedHarvestSchema } from "@/lib/schemas/seedHarvestSchema";
import { useUpsertSeedHarvest } from "@/queries/seed/use-upsert-seed-harvest";
import { Cultivar, Harvest, Talhao } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertHarvestModalProps {
  colheita?: Harvest;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertHarvestModal = ({
  colheita,
  isOpen,
  onClose,
}: UpsertHarvestModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<SeedHarvestFormData>({
    resolver: zodResolver(seedHarvestSchema),
    defaultValues: {
      cultivarId: colheita?.cultivarId ?? "",
      talhaoId: colheita?.talhaoId ?? "",
      date: colheita ? new Date(colheita.date) : new Date(),
      quantityKg: colheita?.quantityKg ?? 0,
      notes: colheita?.notes ?? "",
    },
  });

  useEffect(() => {
    if (colheita) {
      form.reset({
        cultivarId: colheita.cultivarId,
        talhaoId: colheita.talhaoId,
        date: new Date(colheita.date),
        quantityKg: colheita.quantityKg,
        notes: colheita.notes || "",
      });
    } else {
      form.reset();
    }
  }, [colheita, isOpen, form.reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const cycle = getCycle();
      if (!cycle || !cycle.productType) {
        showToast({
          type: "error",
          title: "Erro",
          message: "Nenhum ciclo de produção selecionado.",
        });
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

  const cycle = getCycle();
      
  const { mutate, isPending } = useUpsertSeedHarvest({
    cycleId: cycle?.id!,
    harvestId: colheita?.id,
  });

  const onSubmit = async (data: SeedHarvestFormData) => {
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
          message: colheita
            ? "Colheita atualizada com sucesso!"
            : "Colheita cadastrada com sucesso!",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantityKg"
                render={({field}) => (
                  <QuantityInput label="Quantidade" field={field} suffix=" kg" />
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <Input {...field} placeholder="Opcional" />
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-green text-white mt-4 hover:bg-green/90"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertHarvestModal;
