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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { IndustrySaleFormData } from "@/lib/schemas/industrySale";
import { seedAdjustmentSchema, SeedAdjustStock as SeedAdjustStockFormData } from "@/lib/schemas/seedAdjustStockSchema";
import { useCreateSeedAdjust } from "@/queries/seed/use-create-seed-adjust";
import {
  Cultivar
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface SeedStockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SeedStockAdjustmentModal = ({
  isOpen,
  onClose,
}: SeedStockAdjustmentModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<SeedAdjustStockFormData>({
    resolver: zodResolver(seedAdjustmentSchema)
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const res = await fetch("/api/cultivars/get", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const cultivarData = await res.json();
      setCultivars(cultivarData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);
  
  const { mutate, isPending } = useCreateSeedAdjust();
  
  const onSubmit = (data: SeedAdjustStockFormData) => {
    const signedQuantity = data.direction === "entrada" ? data.quantityKg : -data.quantityKg;
 
    mutate(
      {
        ...data,
        quantityKg: signedQuantity,
      },
      {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: "Ajuste de estoque cadastrada com sucesso!",
        });
  
        onClose();
        form.reset();
      },
      onError: (error: Error) => {
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
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Ajuste de estoque</DialogTitle>
          <DialogDescription>
            Cadastrar um novo ajuste de estoque
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {/* Tipo de ajuste */}
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de ajuste</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="entrada" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Entrada de estoque
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="saida" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Saída de estoque
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
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
                </div>
                <div>
                  {/* Cultivar */}
                  <FormField
                    control={form.control}
                    name="cultivarId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultivar</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cultivar" />
                            </SelectTrigger>
                            <SelectContent>
                              {cultivars.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade (kg)" field={field} />
                  )}
                />
              </div>

              {/* Observações */}
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

export default SeedStockAdjustmentModal;
