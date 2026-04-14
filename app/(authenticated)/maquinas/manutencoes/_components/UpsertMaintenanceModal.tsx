import { ComboBoxOption } from "@/components/combo-option";
import { MoneyInput } from "@/components/inputs";
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
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMachines } from "@/queries/machines/use-machine-query";
import { useMembers } from "@/queries/registrations/use-member";
import { Input } from "@/components/ui/input";

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

  const { data: customers = [] } = useCustomers();
  const { data: machines = [] } = useMachines();
  const { data: members = [] } = useMembers();
  const memberId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === memberId);
  const addresses = selectedMember?.adresses ?? [];
  
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manutenção</DialogTitle>
          <DialogDescription>
            {manutencao ? "Editar manutenção" : "Cadastrar manutenção"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Data e Máquina */}
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
                    name="machineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máquina</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma máquina" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {machines.map((machine) => (
                              <SelectItem key={machine.id} value={machine.id}>
                                <div className="flex justify-between gap-2">
                                  <span>{machine.name}</span>
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

              {/* Cliente, Valor */}
              <div className="grid grid-cols-2 gap-4">
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
                    name="totalValue"
                    render={({ field }) => (
                      <MoneyInput label="Preço Total" field={field} />
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

              {/* Descrição */}
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
                />
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
