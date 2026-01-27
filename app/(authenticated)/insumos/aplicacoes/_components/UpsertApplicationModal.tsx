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
import { getCycle } from "@/lib/cycle";
import { ApiError } from "@/lib/http/api-error";
import { InputApplicationFormData, inputApplicationSchema } from "@/lib/schemas/inputSchema";
import { useUpsertInputApplication } from "@/queries/input/use-input-application";
import { useInputStockQuery } from "@/queries/input/use-input-stock";
import { usePlots } from "@/queries/registrations/use-plot-query";
import { Application } from "@/types/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertApplicationModalProps {
  aplicacao?: Application;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertApplicationModal = ({
  aplicacao,
  isOpen,
  onClose,
}: UpsertApplicationModalProps) => {
    const { showToast } = useSmartToast();

  const form = useForm<InputApplicationFormData>({
    resolver: zodResolver(inputApplicationSchema),
    defaultValues: {
      date: aplicacao ? new Date(aplicacao.date) : new Date(),
      productStockId: aplicacao?.productStockId ?? "",
      talhaoId: aplicacao?.talhaoId ?? "",
      quantity: aplicacao?.quantity ?? 0,
      notes: aplicacao?.notes ?? "",
    },
  });

  useEffect(() => {
    if (aplicacao) {
      form.reset({
        date: new Date(aplicacao.date),
        productStockId: aplicacao.productStockId,
        talhaoId: aplicacao.talhaoId,
        quantity: aplicacao.quantity,
        notes: aplicacao?.notes || "",
      });
    } else {
      form.reset();
    }
  }, [aplicacao, isOpen, form]);

  const { data: talhoes = [] } = usePlots();
  const { data: inputStocks = [] } = useInputStockQuery();

  const cycle = getCycle();

  const { mutate, isPending } = useUpsertInputApplication({
    applicationId: aplicacao?.id,
    cycleId: cycle?.id!,
  });

  const onSubmit = async (data: InputApplicationFormData) => {
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
           message: aplicacao
             ? "Aplicação atualizada com sucesso!"
             : "Aplicação cadastrada com sucesso!",
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
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aplicação</DialogTitle>
          <DialogDescription>
            {aplicacao ? "Editar aplicação" : "Cadastrar aplicação"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="productStockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma insumo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inputStocks.map((stock) => (
                              <SelectItem key={stock.id} value={stock.id}>
                                <div className="flex items-center gap-2">
                                  <span>{stock.product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Intl.NumberFormat("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(stock.stock)}
                                  </span>
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
                name="productStockId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito de origem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inputStocks.map((stock) => (
                              <SelectItem key={stock.id} value={stock.id}>
                                {stock.farm.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} />
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="talhaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talhão da Aplicação</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito de destino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {talhoes.map((talhao) => (
                              <SelectItem key={talhao.id} value={talhao.id}>
                                {talhao.name}
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

export default UpsertApplicationModal;