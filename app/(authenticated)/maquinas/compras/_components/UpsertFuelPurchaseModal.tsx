import { ComboBoxOption } from "@/components/combo-option";
import { MoneyInput, QuantityInput } from "@/components/inputs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { FuelPurchaseFormData, fuelPurchaseSchema } from "@/lib/schemas/fuelPurchaseSchema";
import { useUpsertFuelPurchase } from "@/queries/machines/use-upsert-fuelPurchase";
import {
  Customer,
  FuelPurchase,
  FuelTank
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertFuelPurchaseModalProps {
  compra?: FuelPurchase;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertFuelPurchaseModal = ({
  compra,
  isOpen,
  onClose,
}: UpsertFuelPurchaseModalProps) => {
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tanks, setTanks] = useState<FuelTank[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<FuelPurchaseFormData>({
    resolver: zodResolver(fuelPurchaseSchema),
    defaultValues: {
      date: compra ? new Date(compra.date) : new Date(),
      invoiceNumber: compra?.invoiceNumber || "",
      fileUrl: compra?.fileUrl || "",
      quantity: compra?.quantity || 0,
      unitPrice: compra?.unitPrice || 0,
      totalValue: compra?.totalValue || 0,
      customerId: compra?.customerId || "",
      tankId: compra?.tankId || "",
      paymentCondition: compra?.paymentCondition || PaymentCondition.AVISTA,
      dueDate: compra?.dueDate ? new Date(compra.dueDate) : undefined,
    },
  });

  // Cálculo automático para manter consistência com o schema e envio
  const unitPrice = Number(form.watch("unitPrice") ?? 0);
  const quantity = Number(form.watch("quantity") ?? 0);

  useEffect(() => {
    const total = quantity * unitPrice;
    form.setValue("totalValue", Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0);
  }, [quantity, unitPrice, form]);

  useEffect(() => {
    if (compra) {
      form.reset({
        date: new Date(compra.date),
        invoiceNumber: compra.invoiceNumber || "",
        fileUrl: compra.fileUrl || "",
        quantity: compra.quantity,
        unitPrice: compra.unitPrice,
        totalValue: compra.totalValue,
        customerId: compra.customerId,
        tankId: compra.tankId,
        paymentCondition: compra.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: compra.dueDate ? new Date(compra.dueDate) : undefined,
      });
    } else {
      form.reset();
    }
  }, [compra, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [tankRes, customerRes] = await Promise.all([
        fetch("/api/machines/fuel-tank", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [tankData, customerData] = await Promise.all([
        tankRes.json(),
        customerRes.json(),
      ]);
      setTanks(tankData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);
  
  const { mutate, isPending } = useUpsertFuelPurchase({
    fuelPurchaseId: compra?.id,
  });
  
  const onSubmit = (data: FuelPurchaseFormData) => {
    mutate(data, {
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
          <DialogTitle>Compra</DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-4">
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
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nota Fiscal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  {/* Cliente */}
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <ComboBoxOption
                            options={customers.map((c) => ({
                              label: c.name,
                              value: c.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione um cliente"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tanque, Quantidade e Preço Unitário */}
              <div className="grid grid-cols-4 gap-4">
                <div className="grid col-span-2">
                  <FormField
                    control={form.control}
                    name="tankId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanque</FormLabel>
                        <FormControl>
                          <ComboBoxOption
                            options={tanks.map((t) => ({
                              label: t.name,
                              value: t.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione um tanque"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <QuantityInput label="Quantidade" field={field} suffix=" L" />
                    )}
                  />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Unitário" field={field} />
                  )}
                />
              </div>
              </div>


              {/* Condição de Pagamento (FormField + condicional APRAZO) */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <MoneyInput label="Preço Total" field={field} readonly />
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? PaymentCondition.AVISTA}
                          onValueChange={(v) => field.onChange(v as PaymentCondition)}
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
                {form.watch("paymentCondition") === PaymentCondition.APRAZO && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

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

export default UpsertFuelPurchaseModal;
