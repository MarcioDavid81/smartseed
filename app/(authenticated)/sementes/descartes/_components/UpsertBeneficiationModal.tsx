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
import { Textarea } from "@/components/ui/textarea";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { BeneficiationFormData, beneficiationSchema } from "@/lib/schemas/seedBeneficiationSchema";
import { useUpsertSeedBeneficiation } from "@/queries/seed/use-upsert-seed-beneficiation";
import { Beneficiation, Cultivar, IndustryDeposit } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface UpsertBeneficiationModalProps {
  descarte?: Beneficiation;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertBeneficiationModal = ({
  descarte,
  isOpen,
  onClose,
}: UpsertBeneficiationModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<BeneficiationFormData>({
    resolver: zodResolver(beneficiationSchema),
    defaultValues: {
      cultivarId: descarte?.cultivarId ?? "",
      date: descarte ? new Date(descarte.date) : new Date(),
      quantityKg: descarte?.quantityKg ?? 0,
      destinationId: descarte?.destinationId ?? "",
      notes: descarte?.notes ?? "",
    },
  });

  useEffect(() => {
    if (descarte) {
      form.reset({
        cultivarId: descarte.cultivarId,
        date: new Date(descarte.date),
        quantityKg: descarte.quantityKg,
        destinationId: descarte.destinationId,
        notes: descarte.notes || "",
      });
    } else {
      form.reset();
    }
  }, [descarte, isOpen, form.reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const cycle = getCycle();
            if (!cycle || !cycle.productType) {
              toast.error("Nenhum ciclo de produção selecionado.");
              return;
            }

      const [cultivarRes, depositRes] = await Promise.all([
        fetch(`/api/cultivars/available-for-beneficiation?productType=${cycle.productType as ProductType}`  , {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/deposit", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const depositData = await depositRes.json();

      setCultivars(cultivarData);
      setDeposits(depositData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const cycle = getCycle();

  const { mutate, isPending } = useUpsertSeedBeneficiation({ 
    cycleId: cycle?.id!, 
    beneficiationId: descarte?.id
  });

  const onSubmit = (data: BeneficiationFormData) => {
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
          message: descarte ? 
          "Descarte atualizado com sucesso" : 
          "Descarte cadastrado com sucesso",
        });
        onClose();
        form.reset();
      },
      onError: (error: Error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || `Erro ao ${
            descarte ? "atualizar" : "criar"
          } descarte.`,
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Descarte</DialogTitle>
          <DialogDescription>
            {descarte ? "Editar descarte" : "Cadastrar descarte"}
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

              <FormField
                control={form.control}
                name="destinationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito de Destino</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um depósito" />
                        </SelectTrigger>
                        <SelectContent>
                          {deposits.map((deposit) => (
                            <SelectItem key={deposit.id} value={deposit.id}>
                              <div className="flex items-center gap-2">
                                <span>{deposit.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

export default UpsertBeneficiationModal;
