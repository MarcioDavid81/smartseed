"use client";

import { PRODUCT_CLASS_OPTIONS } from "@/app/(authenticated)/_constants/insumos";
import { formatNumber } from "@/app/_helpers/currency";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import {
  InputTransferFormData,
  inputTransferSchema,
} from "@/lib/schemas/inputSchema";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useInputStockQuery } from "@/queries/input/use-input-stock";
import { useUpsertInputTransfer } from "@/queries/input/use-input-transfer";
import { useFarms } from "@/queries/registrations/use-farm";
import { Transfer } from "@/types/transfer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

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

  const selectedProductId = form.watch("productId");
  const selectedOriginFarmId = form.watch("originFarmId");

  const { data: productStocks = [] } = useInputStockQuery(
    selectedProductId
      ? { productId: selectedProductId, showZero: false }
      : { showZero: false },
  );

  const availableOriginFarms = useMemo(() => {
    if (!selectedProductId) return [];

    const stocksByFarmId = new Map(
      productStocks
        .filter((s) => s.productId === selectedProductId && s.stock > 0)
        .map((s) => [s.farmId, s.stock]),
    );

    return farms
      .map((farm) => {
        const stock = stocksByFarmId.get(farm.id);
        if (stock === undefined) return null;
        return {
          id: farm.id,
          name: farm.name,
          quantity: stock,
        };
      })
      .filter(Boolean);
  }, [selectedProductId, farms, productStocks]);

  const availableDestFarms = farms.filter((f) => f.id !== selectedOriginFarmId);

  useEffect(() => {
    const currentDestFarmId = form.getValues("destFarmId");
    if (currentDestFarmId && currentDestFarmId === selectedOriginFarmId) {
      form.setValue("destFarmId", "", { shouldValidate: true });
    }
  }, [selectedOriginFarmId, form]);

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
      <DialogContent className="scrollbar-hide max-h-[95vh] w-[calc(100%-1rem)] max-w-2xl overflow-scroll rounded-2xl sm:w-full">
        <DialogHeader>
          <DialogTitle>Transferência</DialogTitle>
          <DialogDescription>
            {transferencia ? "Editar transferência" : "Cadastrar transferência"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                                    {PRODUCT_CLASS_OPTIONS.find(
                                      (option) =>
                                        option.value === product.class,
                                    )?.label || product.class}
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
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="originFarmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fazenda Origem</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedProductId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !selectedProductId
                                    ? "Selecione um produto primeiro"
                                    : availableOriginFarms.length === 0
                                      ? "Sem estoque disponível"
                                      : "Selecione uma fazenda de origem"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableOriginFarms.map((farm) => (
                              <SelectItem
                                key={farm?.id || ""}
                                value={farm?.id || ""}
                              >
                                <div className="flex w-full justify-between gap-2">
                                  <span>{farm?.name || ""}</span>
                                  <span className="text-muted-foreground">
                                    {formatNumber(farm?.quantity || 0)}
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
                  name="destFarmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fazenda Destino</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedOriginFarmId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !selectedOriginFarmId
                                    ? "Selecione a fazenda origem primeiro"
                                    : availableDestFarms.length === 0
                                      ? "Nenhuma fazenda disponível"
                                      : "Selecione uma fazenda de destino"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDestFarms.map((farm) => (
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
