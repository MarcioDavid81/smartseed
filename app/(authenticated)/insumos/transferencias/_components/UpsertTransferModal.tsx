"use client";

import { PRODUCT_CLASS_OPTIONS } from "@/app/(authenticated)/_constants/insumos";
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
import { ApiError } from "@/lib/http/api-error";
import { InputTransferFormData, inputTransferSchema } from "@/lib/schemas/inputSchema";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useUpsertInputTransfer } from "@/queries/input/use-input-transfer";
import { useFarms } from "@/queries/registrations/use-farm";
import { Farm, Insumo } from "@/types";
import { Transfer } from "@/types/transfer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertTransferModalProps {
  transferencia?: Transfer;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertTransferModal = ({
  transferencia,
  isOpen,
  onClose,
}: UpsertTransferModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<InputTransferFormData>({
    resolver: zodResolver(inputTransferSchema),
    defaultValues: {
      date: transferencia ? new Date(transferencia.date) : new Date(),
      productId: transferencia?.productId ?? "",
      quantity: transferencia?.quantity ?? 0,
      originFarmId: transferencia?.originFarmId ?? "",
      destFarmId: transferencia?.destFarmId ?? "",
    },
  });

  useEffect(() => {
    if (transferencia) {
      form.reset({
        date: new Date(transferencia.date),
        productId: transferencia.productId,
        quantity: transferencia.quantity,
        originFarmId: transferencia.originFarmId,
        destFarmId: transferencia.destFarmId,
      });
    } else {
      form.reset();
    }
  }, [transferencia, isOpen, form]);

  const { data: farms = [] } = useFarms();
  const { data: products = [] } = useInputProductQuery();

  const { mutate, isPending } = useUpsertInputTransfer({
    transferId: transferencia?.id,
  });

   const onSubmit = async (data: InputTransferFormData) => {       
     mutate(data, {
       onSuccess: () => {
         showToast({
           type: "success",
           title: "Sucesso",
           message: transferencia
             ? "Transferência atualizada com sucesso!"
             : "Transferência cadastrada com sucesso!",
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
          <DialogTitle>Transferência</DialogTitle>
          <DialogDescription>
            {transferencia ? "Editar transferência" : "Cadastrar transferência"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="productId"
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
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {
                                      PRODUCT_CLASS_OPTIONS.find(
                                        (option) => option.value === product.class)?.label || product.class
                                    }
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
                name="originFarmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito Origem</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito de origem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name}
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
                name="destFarmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito Destino</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito de destino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.name}
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

              <Button
                type="submit"
                disabled={isPending}
                className="mt-4 w-full bg-green text-white"
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

export default UpsertTransferModal;
