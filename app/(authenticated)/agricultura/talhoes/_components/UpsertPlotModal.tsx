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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Farm, Talhao } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { PlotFormData, plotSchema } from "@/lib/schemas/plotSchema";
import { useUpsertPlot } from "@/queries/registrations/use-upsert-plot";
import { QuantityInput } from "@/components/inputs";

interface UpsertPlotModalProps {
  talhao?: Talhao;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertPlotModal = ({
  talhao,
  isOpen,
  onClose,
}: UpsertPlotModalProps) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const { showToast } = useSmartToast();

  const form = useForm<PlotFormData>({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      name: talhao?.name ?? "",
      area: talhao?.area ?? 0,
      farmId: talhao?.farmId ?? "",
    },
  });

  useEffect(() => {
    if (talhao) {
      form.reset({
        name: talhao.name,
        area: talhao.area,
        farmId: talhao.farmId,
      });
    } else {
      form.reset();
    }
  }, [talhao, isOpen, form.reset]);

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

  const { mutate, isPending } = useUpsertPlot({
    plotId: talhao?.id,
  })

  const onSubmit = async (data: PlotFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso!",
          message: talhao
            ? "Talhão atualizado com sucesso!"
            : "Talhão cadastrado com sucesso!",
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || "Ocorreu um erro ao salvar o talhão. Por favor, tente novamente.",
        });
      },
    });
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Talhões</DialogTitle>
          <DialogDescription>
            {talhao ? "Editar talhão" : "Cadastrar talhão"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <QuantityInput label="Área" field={field} suffix=" ha" />
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fazenda</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma fazenda" />
                        </SelectTrigger>
                        <SelectContent>
                          {farms.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
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
            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-green text-white"
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

export default UpsertPlotModal;
