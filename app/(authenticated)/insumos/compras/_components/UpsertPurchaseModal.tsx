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
import { Purchase } from "@/types/purchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { PaymentCondition } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { InputPurchaseFormData, inputPurchaseSchema } from "@/lib/schemas/inputSchema";
import { useUpsertInputPurchase } from "@/queries/input/use-input-purchase";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { useFarms } from "@/queries/registrations/use-farm";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useCustomers } from "@/queries/registrations/use-customer";
import { PRODUCT_CLASS_OPTIONS } from "@/app/(authenticated)/_constants/insumos";

interface UpsertPurchaseModalProps {
  compra?: Purchase;
  isOpen: boolean;
  onClose: () => void;

  /** 🆕 contexto de atendimento */
  purchaseOrderItemId?: string;
  productId?: string;
  customerId?: string;
  customerName?: string;
  unitPrice?: number;
  maxQuantityKg?: number;
  initialQuantity?: number;
}

const UpsertPurchaseModal = ({
  compra,
  isOpen,
  onClose,
  purchaseOrderItemId,
  productId,
  customerId,
  customerName,
  unitPrice: unitPriceFromOrder,
  maxQuantityKg,
  initialQuantity,
}: UpsertPurchaseModalProps) => {
  const { showToast } = useSmartToast();

  const suggestedQuantity = initialQuantity ?? maxQuantityKg ?? undefined;
  const customerPlaceholder = customerName ?? "Selecione um fornecedor";

  const form = useForm<InputPurchaseFormData>({
    resolver: zodResolver(inputPurchaseSchema),
    defaultValues: {
      date: compra?.date ? new Date(compra.date) : new Date(),
      customerId: compra?.customerId ?? customerId ?? "",
      productId: compra?.productId ?? productId ?? "",
      invoiceNumber: compra?.invoiceNumber ?? "",
      quantity: compra?.quantity ?? suggestedQuantity ?? 0,
      unitPrice: compra?.unitPrice ?? unitPriceFromOrder ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      farmId: compra?.farmId ?? "",
      notes: compra?.notes ?? "",
      paymentCondition: compra?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: compra?.dueDate ? new Date(compra.dueDate) : undefined,
      purchaseOrderItemId: purchaseOrderItemId ?? undefined,
    },
  });

  const unitPrice = form.watch("unitPrice");
  const quantity = form.watch("quantity");
  const paymentCondition = form.watch("paymentCondition");

  useEffect(() => {
    const total = unitPrice * quantity;
    form.setValue(
      "totalPrice",
      Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0
    );
  }, [unitPrice, quantity]);

  useEffect(() => {
    if (compra) {
      form.reset({
        date: compra?.date ? new Date(compra.date) : new Date(),
        customerId: compra.customerId,
        productId: compra.productId,
        invoiceNumber: compra.invoiceNumber,
        quantity: compra.quantity,
        unitPrice: compra.unitPrice,
        farmId: compra.farmId,
        notes: compra.notes || "",
        paymentCondition: compra.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: compra?.dueDate ? new Date(compra.dueDate) : undefined,
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
      });
    } else {
      form.reset({
        date: new Date(),
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
        productId: productId ?? "",
        customerId: customerId ?? "",
        unitPrice: unitPriceFromOrder ?? 0,
        quantity: suggestedQuantity ?? 0,
      });
    }
  }, [
    compra,
    isOpen,
    purchaseOrderItemId,
    productId,
    customerId,
    unitPriceFromOrder,
    suggestedQuantity,
    form,
  ]);

  const { data: farms = [] } = useFarms();
  const { data: products = [] } = useInputProductQuery();
  const { data: customers = [] } = useCustomers();


   const { mutate, isPending } = useUpsertInputPurchase({
     purchaseId: compra?.id,
     purchaseOrderItemId: purchaseOrderItemId ?? undefined,
   });
 
   const onSubmit = async (data: InputPurchaseFormData) => {  
    if (
      purchaseOrderItemId &&
      maxQuantityKg &&
      data.quantity > maxQuantityKg
    ) {
      showToast({
        type: "error",
        title: "Quantidade inválida",
        message: "A quantidade excede o saldo disponível do pedido.",
      });
      return;
    }         
     mutate({
      ...data,
      purchaseOrderItemId: purchaseOrderItemId ?? undefined,      
     }, {
       onSuccess: () => {
         showToast({
           type: "success",
           title: "Sucesso",
           message: compra
             ? "Compra atualizada com sucesso!"
             : "Compra cadastrada com sucesso!",
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

  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId, { shouldValidate: true });
    }

    if (customerId) {
      form.setValue("customerId", customerId, { shouldValidate: true });
    }

    if (typeof unitPriceFromOrder === "number") {
      form.setValue("unitPrice", unitPriceFromOrder, {
        shouldValidate: true,
      });
    }

    if (typeof suggestedQuantity === "number") {
      form.setValue("quantity", suggestedQuantity, { shouldValidate: true });
    }
  }, [productId, customerId, unitPriceFromOrder, suggestedQuantity, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Compra
            {purchaseOrderItemId && (
              <span className="text-xs bg-green/10 text-green px-2 py-1 rounded">
                Atendimento de Pedido
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Produto */}
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
                          disabled={!!purchaseOrderItemId}
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
                {/* Fornecedor */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!purchaseOrderItemId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={customerPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                  <span>{customer.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {customer.cpf_cnpj}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Data */}
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
                {/* Nota Fiscal */}
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Fiscal</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Quantidade */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput
                      label="Quantidade"
                      field={field}
                      max={maxQuantityKg}
                    />
                  )}
                />               
                {/* Preço Unitário */}
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <MoneyInput 
                      label="Preço Unitário" 
                      field={field} 
                      readonly={!!purchaseOrderItemId} 
                    />
                  )}
                />
              {/* Valor Total */}
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Total" field={field} readonly />
                  )}
                />
              </div>


              {/* Fazenda */}
              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito" />
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
              {/* Condição de Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <FormControl>
                      <Select
                        onValueChange={(value: PaymentCondition) =>
                          field.onChange(value)
                        }
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a condição" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PaymentCondition.AVISTA}>À Vista</SelectItem>
                          <SelectItem value={PaymentCondition.APRAZO}>À Prazo</SelectItem>
                        </SelectContent>
                      </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Data de Vencimento */}
                {paymentCondition === PaymentCondition.APRAZO && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
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
                )}
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
                className="mt-4 w-full bg-green text-white hover:bg-green/90"
                onClick={() => console.log(form.getValues())}
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

export default UpsertPurchaseModal;
