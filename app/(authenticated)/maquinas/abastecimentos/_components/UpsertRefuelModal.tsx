import { ComboBoxOption } from "@/components/combo-option";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { RefuelFormData, refuelSchema } from "@/lib/schemas/refuelSchema";
import { useUpsertRefuel } from "@/queries/machines/use-upsert-refuel";
import {
  FuelTank,
  Machine,
  Refuel
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { NumericFormat } from "react-number-format";

interface UpsertRefuelModalProps {
  abastecimento?: Refuel;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertRefuelModal = ({
  abastecimento,
  isOpen,
  onClose,
}: UpsertRefuelModalProps) => {
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [tanks, setTanks] = useState<FuelTank[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<RefuelFormData>({
    resolver: zodResolver(refuelSchema),
    defaultValues: {
      date: abastecimento ? new Date(abastecimento.date) : new Date(),
      quantity: abastecimento?.quantity || 0,
      tankId: abastecimento?.tankId || "",
      machineId: abastecimento?.machineId || "",
      hourmeter: abastecimento?.hourmeter || undefined,
      odometer: abastecimento?.odometer || undefined,
    },
  });

  useEffect(() => {
    if (abastecimento) {
      form.reset({
        date: new Date(abastecimento.date),
        quantity: abastecimento.quantity,
        tankId: abastecimento.tankId,
        machineId: abastecimento.machineId,
        hourmeter: abastecimento.hourmeter || undefined,
        odometer: abastecimento.odometer || undefined,
      });
    } else {
      form.reset();
    }
  }, [abastecimento, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [tankRes, machineRes] = await Promise.all([
        fetch("/api/machines/fuel-tank", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/machines/machine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [tankData, machineData] = await Promise.all([
        tankRes.json(),
        machineRes.json(),
      ]);
      setTanks(tankData);
      setMachines(machineData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);
  
  const { mutate, isPending } = useUpsertRefuel({
    refuelId: abastecimento?.id,
  });
  
  const onSubmit = (data: RefuelFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: abastecimento
            ? "Abastecimento atualizado com sucesso!"
            : "Abastecimento cadastrado com sucesso!",
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
            {abastecimento ? "Editar abastecimento" : "Cadastrar abastecimento"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Data e Quantidade */}
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
                    name="quantity"
                    render={({ field }) => (
                      <QuantityInput label="Quantidade" field={field} suffix=" L" />
                    )}
                  />
                </div>
              </div>

              {/* Tanque e Máquina */}
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                      name="machineId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Veículo</FormLabel>
                          <FormControl>
                            <ComboBoxOption
                              options={machines.map((t) => ({
                                label: t.name,
                                value: t.id,
                              }))}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Selecione um veículo/equipamento"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>

              {/* Horímetro ou Odômetro */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourmeter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horímetro</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          value={field.value}
                          thousandSeparator="."
                          decimalSeparator="," 
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          suffix=" Hr"
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
                <FormField
                  control={form.control}
                  name="odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odômetro</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          value={field.value}
                          thousandSeparator="."
                          decimalSeparator="," 
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          suffix=" Km"
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertRefuelModal;
