import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
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
import { industryAdjustmentSchema, IndustryAdjustStockFormData } from "@/lib/schemas/industryAdjustStockSchema";
import { useCreateStockAdjust } from "@/queries/industry/use-create-stock-adjust";
import { useIndustryDeposits } from "@/queries/industry/use-deposits-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface IndustryStockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IndustryStockAdjustmentModal = ({
  isOpen,
  onClose,
}: IndustryStockAdjustmentModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<IndustryAdjustStockFormData>({
    resolver: zodResolver(industryAdjustmentSchema)
  });
 
  const { data: deposits = [] } = useIndustryDeposits();

  const { mutate, isPending } = useCreateStockAdjust();
  
  const onSubmit = (data: IndustryAdjustStockFormData) => {
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
              <div className="grid grid-cols-2 gap-4">
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
                  {/* Depósito */}
                  <FormField
                    control={form.control}
                    name="industryDepositId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depósito</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito" />
                            </SelectTrigger>
                            <SelectContent>
                              {deposits.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* Produto */}
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produto</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_TYPE_OPTIONS.map(({ label, value }) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    <span>{label}</span>
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
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="quantityKg"
                    render={({ field }) => (
                      <QuantityInput label="Quantidade (kg)" field={field} />
                    )}
                  />
                </div>
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

export default IndustryStockAdjustmentModal;
