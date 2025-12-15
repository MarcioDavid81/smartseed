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
import { FuelTank } from "@/types";
import { useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { useUpsertMachine } from "@/queries/machines/use-upsert-machine";
import { FuelTankFormData, fuelTankSchema } from "@/lib/schemas/fuelTankSchema";
import { useUpsertFuelTank } from "@/queries/machines/use-upsert-fuelTank";


interface UpsertFuelTankModalProps {
  fuelTank?: FuelTank,
  isOpen: boolean;
  onClose: () => void;
}

export function UpsertFuelTankModal({
  fuelTank,
  isOpen,
  onClose,
}: UpsertFuelTankModalProps) {
  const { showToast } = useSmartToast();

  const form = useForm<FuelTankFormData>({
    resolver: zodResolver(fuelTankSchema),
    defaultValues: {
      name: fuelTank?.name || "",
      capacity: fuelTank?.capacity || 0,
    }
  });

  useEffect(() => {
    if (fuelTank) {
      form.reset({
        name: fuelTank.name,
        capacity: fuelTank.capacity,
      });
    } else {
      form.reset();
    }
  }, [fuelTank, isOpen, form])

  const { mutate, isPending } = useUpsertFuelTank({
    fuelTankId: fuelTank?.id,
  });

  const onSubmit = (data: FuelTankFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: fuelTank
            ? "Tanque de combustível atualizado com sucesso!"
            : "Tanque de combustível cadastrado com sucesso!",
        });

        onClose();
        form.reset();
      },
      onError: (error: Error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || "Erro ao cadastrar/atualizar tanque de combustível.",
        });
      },
    });
  };

    useEffect(() => {
      if (!isOpen) form.reset();
    }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tanques de Combustível
          </DialogTitle>
          <DialogDescription>
            {fuelTank ? "Editar tanque de combustível" : "Cadastrar tanque de combustível"}
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
                      <Input placeholder="Ex: Tanque Fazenda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}

              />
              {/* Capacidade */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade (L)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        thousandSeparator="."
                        decimalSeparator="," 
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        suffix=" L"
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
}
