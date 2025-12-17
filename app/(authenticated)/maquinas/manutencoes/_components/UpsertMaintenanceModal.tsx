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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { maintenanceSchema, MaintenanceFormData } from "@/lib/schemas/maintenanceSchema";
import { useUpsertMaintenance } from "@/queries/machines/use-upsert-maintenance";
import {
  Customer,
  Maintenance,
  Machine
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertMaintenanceModalProps {
  manutencao?: Maintenance;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertMaintenanceModal = ({
  manutencao,
  isOpen,
  onClose,
}: UpsertMaintenanceModalProps) => {
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: manutencao ? new Date(manutencao.date) : new Date(),
      machineId: manutencao?.machineId || "",
      customerId: manutencao?.customerId || "",
      description: manutencao?.description || "",
      totalValue: manutencao?.totalValue || 0,
      paymentCondition: manutencao?.paymentCondition,
      dueDate: manutencao?.dueDate ? new Date(manutencao.dueDate) : undefined,
    },
  });

  useEffect(() => {
    if (manutencao) {
      form.reset({
        date: new Date(manutencao.date),
        machineId: manutencao.machineId,
        customerId: manutencao.customerId,
        totalValue: manutencao.totalValue,
        description: manutencao.description,
        paymentCondition: manutencao.paymentCondition,
        dueDate: manutencao.dueDate ? new Date(manutencao.dueDate) : undefined,
      });
    } else {
      form.reset();
    }
  }, [manutencao, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [machineRes, customerRes] = await Promise.all([
        fetch("/api/machines/machine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [machineData, customerData] = await Promise.all([
        machineRes.json(),
        customerRes.json(),
      ]);
      setMachines(machineData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);
  
  const { mutate, isPending } = useUpsertMaintenance({
    maintenanceId: manutencao?.id,
  });
  
  const onSubmit = (data: MaintenanceFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: manutencao
            ? "Manutenção atualizada com sucesso!"
            : "Manutenção cadastrada com sucesso!",
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
          <DialogTitle>Manutenção</DialogTitle>
          <DialogDescription>
            {manutencao ? "Editar manutenção" : "Cadastrar manutenção"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
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
                  <FormField
                    control={form.control}
                    name="machineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máquina</FormLabel>
                        <FormControl>
                          <ComboBoxOption
                            options={machines.map((m) => ({
                              label: m.name,
                              value: m.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione uma máquina"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tanque, Quantidade e Preço Unitário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                <div>
                  <FormField
                    control={form.control}
                    name="totalValue"
                    render={({ field }) => (
                      <MoneyInput label="Preço Total" field={field} />
                    )}
                  />
                </div>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
                />
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

export default UpsertMaintenanceModal;
