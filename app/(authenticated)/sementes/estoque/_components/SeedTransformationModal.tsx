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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { SeedTransformationFormData } from "@/lib/schemas/transformation";
import { seedTransformationSchema } from "@/lib/schemas/transformation";
import { useCreateSeedTransformation } from "@/queries/seed/use-create-seed-transformation";
import {
  Cultivar,
  IndustryDeposit
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface SeedTransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SeedTransformationModal = ({
  isOpen,
  onClose,
}: SeedTransformationModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const { showToast } = useSmartToast();

  const form = useForm<SeedTransformationFormData>({
    resolver: zodResolver(seedTransformationSchema)
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, depositRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/deposit", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const cultivarData = await cultivarRes.json();
      const depositData = await depositRes.json();
      
      setDeposits(depositData);
      setCultivars(cultivarData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);
  
  const { mutate, isPending } = useCreateSeedTransformation();
  
  const onSubmit = (data: SeedTransformationFormData) => { 
    mutate(
      {
        ...data,
      },
      {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: "Transformação de sementes cadastrada com sucesso!",
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
          <DialogTitle>Transformação de sementes</DialogTitle>
          <DialogDescription>
            Cadastrar uma nova transformação de sementes
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
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} suffix=" kg" />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* Cultivar */}
                  <FormField
                    control={form.control}
                    name="cultivarId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultivar</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cultivar" />
                            </SelectTrigger>
                            <SelectContent>
                              {cultivars.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
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
                <div>
                  {/* Depósito */}
                  <FormField
                    control={form.control}
                    name="destinationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depósito</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um depósito" />
                            </SelectTrigger>
                            <SelectContent>
                              {deposits.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name}
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

export default SeedTransformationModal;
