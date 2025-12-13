"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { MACHINE_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/machines";
import { MachineFormData, machineSchema } from "@/lib/schemas/machineSchema";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { Machine } from "@/types";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";


interface UpsertMachineModalProps {
  machine?: Machine;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function UpsertMachineModal({
  machine,
  isOpen,
  onClose,
  onUpdated,
}: UpsertMachineModalProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useSmartToast();

  const form = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      name: machine?.name || "",
      type: machine?.type || "",
      brand: machine?.brand || "",
      model: machine?.model || "",
      plate: machine?.plate || "",
      serialNumber: machine?.serialNumber || "",
      hourmeter: machine?.hourmeter || 0,
      odometer: machine?.odometer || 0,
    }
  });

  useEffect(() => {
    if (machine) {
      form.reset({
        name: machine.name,
        type: machine.type,
        brand: machine.brand,
        model: machine.model,
        plate: machine.plate,
        serialNumber: machine.serialNumber,
        hourmeter: machine.hourmeter,
        odometer: machine.odometer,
      });
    } else {
      form.reset();
    }
  }, [machine, isOpen, form])

  const onSubmit = async (data: MachineFormData) => {
    setLoading(true);
  try {
    const token = getToken();
    if (!token) {
      showToast({
        type: "error",
        title: "Erro de autenticação",
        message: "Usuário não autenticado.",
      });
      return;
    }

    const url = machine
      ? `/api/machines/machine/${machine.id}`
      : `/api/machines/machine`;

    const method = machine ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      showToast({
        type: "error",
        title: "Erro",
        message: result.error || "Erro ao salvar máquina."
      })
      return;
    }

    showToast({
      type: "success",
      title: "Sucesso",
      message: machine
        ? "Máquina atualizada com sucesso!"
        : "Máquina cadastrada com sucesso!",
    });

    onClose();
    form.reset();
    if (onUpdated) onUpdated(); // callback externo opcional
    onClose();

  } catch (e) {
    console.error(e);
    showToast({
      type: "error",
      title: "Erro",
      message: "Erro ao salvar máquina.",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Máquinas
          </DialogTitle>
          <DialogDescription>
            {machine ? "Editar máquina" : "Cadastrar máquina"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Trator John Deere 7R" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Tipo */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MACHINE_TYPE_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Marca */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: John Deere" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Modelo */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 7R 330" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Placa */}
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="AAA-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Número de série */}
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Horímetro */}
              <FormField
                control={form.control}
                name="hourmeter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horímetro (h)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        thousandSeparator="."
                        decimalSeparator="," 
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        suffix=" h"
                        inputMode="numeric"
                        valueIsNumericString
                        isAllowed={(values) => {
                          const { floatValue } = values;
                          return floatValue === undefined || floatValue >= 0;
                        }}
                        className="font-light"
                        onValueChange={(values) => {
                          field.onChange(values.floatValue ?? 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Odômetro */}
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quilometragem (km)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        thousandSeparator="."
                        decimalSeparator="," 
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        suffix=" km"
                        inputMode="numeric"
                        valueIsNumericString
                        isAllowed={(values) => {
                          const { floatValue } = values;
                          return floatValue === undefined || floatValue >= 0;
                        }}
                        className="font-light"
                        onValueChange={(values) => {
                          field.onChange(values.floatValue ?? 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green text-white mt-4"
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
