"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
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
import { useEffect } from "react";


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
      houmeter: machine?.houmeter || 0,
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
        houmeter: machine.houmeter,
        odometer: machine.odometer,
      });
    }
  }, [machine, isOpen, form])

  const onSubmit = async (data: MachineFormData) => {
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
        title: "Erro ao salvar máquina",
        message: result.error || "Erro inesperado."
      })
      return;
    }

    showToast({
      type: "success",
      title: machine ? "Máquina atualizada com sucesso!" : "Máquina cadastrada com sucesso!",
      message: result.message || "",
    });

    onClose();
    form.reset();
    if (onUpdated) onUpdated(); // callback externo opcional
    onClose();

  } catch (e) {
    console.error(e);
    showToast({
      type: "error",
      title: "Erro inesperado ao salvar máquina.",
      message: "Tente novamente mais tarde.",
    });
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {machine ? "Editar Máquina" : "Cadastrar Máquina"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
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

            <div className="grid grid-cols-2 gap-3">
              {/* Horímetro */}
              <FormField
                control={form.control}
                name="houmeter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horímetro (h)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {machine ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
