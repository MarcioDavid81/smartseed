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
import { FuelPurchaseFormData, fuelPurchaseSchema } from "@/lib/schemas/fuelPurchaseSchema";
import { useFuelTank } from "@/queries/machines/use-fuelTank-query";
import { useUpsertFuelPurchase } from "@/queries/machines/use-upsert-fuelPurchase";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMembers } from "@/queries/registrations/use-member";
import { FuelPurchase } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition } from "@prisma/client";
import { useEffect } from "react";
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

  const { data: customers = [] } = useCustomers();
  const { data: tanks = [] } = useFuelTank();
  const { data: members = [] } = useMembers();
  const memberId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === memberId);
  const addresses = selectedMember?.adresses ?? [];
  
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Compra</DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Data, Nota Fiscal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Sócio, Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Sócio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma socio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex justify-between gap-2">
                              <span>{member.name}</span>
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
                name="memberAdressId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!memberId || addresses.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma inscrição estadual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {addresses.map((memberAdress) => (
                          <SelectItem key={memberAdress.id} value={memberAdress.id}>
                            <div className="flex justify-between gap-2">
                              <span>{memberAdress.stateRegistration}</span>
                              <span className="text-muted-foreground">
                                {memberAdress.district}, {memberAdress.city} - {memberAdress.state}
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

            {/* Cliente, Tanque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="tankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanque</FormLabel>
                    <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tanque" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tanks.map((tank) => (
                          <SelectItem key={tank.id} value={tank.id}>
                            <div className="flex items-center gap-2">
                              <span>{tank.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {tank.stock} L
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

            {/* Quantidade, Preço e Valor Total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <QuantityInput label="Quantidade" field={field} suffix=" L" />
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <MoneyInput label="Preço Unitário" field={field} />
                )}
              />
              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <MoneyInput label="Preço Total" field={field} readonly />
                )}
              />
            </div>


              {/* Condição de Pagamento, Data de Vencimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertFuelPurchaseModal;
