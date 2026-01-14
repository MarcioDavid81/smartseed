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
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Farm, Rain } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { RainFormData, rainSchema } from "@/lib/schemas/rainSchema";
import { getToken } from "@/lib/auth-client";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuantityInput } from "@/components/inputs";
import { useUpsertRain } from "@/queries/industry/use-rain";

interface UpsertRainModalProps {
  rain?: Rain;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertRainModal = ({
  rain,
  isOpen,
  onClose,
}: UpsertRainModalProps) => {
  const { showToast } = useSmartToast();
  const [farms, setFarms] = useState<Farm[]>([]);

  const form = useForm<RainFormData>({
    resolver: zodResolver(rainSchema),
    defaultValues: {
      date: rain ? new Date(rain.date) : new Date(),
      farmId: rain?.farmId || "",
      quantity: rain?.quantity || 0,
    },
  });

  useEffect(() => {
    if (rain) {
      form.reset({
        date: new Date(rain.date),
        farmId: rain.farmId || "",
        quantity: rain.quantity || 0,
      });
    } else {
      form.reset();
    }
  }, [rain, isOpen, form]);

  useEffect(() => {
    const fetchFarms = async () => {
      const token = getToken();
      const res = await fetch("/api/farms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFarms(data);
    };

    if (isOpen) fetchFarms();
  
  }, [isOpen]);

  const { mutate, isPending } = useUpsertRain({
      rainId: rain?.id,
    });

  const onSubmit = async (data: RainFormData) => {
    mutate(data, {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Sucesso",
            message: rain
              ? "Chuva atualizada com sucesso!"
              : "Chuva cadastrada com sucesso!",
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
            message: error.message || `Erro ao ${
              rain ? "atualizar" : "criar"
            } chuva.`,
          });
        },
      });
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form.reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chuvas</DialogTitle>
          <DialogDescription>
            {rain ? "Editar chuva" : "Cadastrar chuva"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
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
                    name="farmId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fazenda</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma fazenda" />
                            </SelectTrigger>
                            <SelectContent>
                              {farms.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
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
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade" field={field} suffix=" mm" />
                  )}
                />
                </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full bg-green text-white"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertRainModal;
