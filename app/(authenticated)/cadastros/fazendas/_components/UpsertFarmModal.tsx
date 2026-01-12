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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Farm } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { FarmFormData, farmSchema } from "@/lib/schemas/farmSchema";
import { useUpsertFarm } from "@/queries/registrations/use-farm";

interface UpsertFarmModalProps {
  farm?: Farm;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertFarmModal = ({
  farm,
  isOpen,
  onClose,
}: UpsertFarmModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: farm?.name ?? "",
    },
  });

  useEffect(() => {
    if (farm) {
      form.reset({
        name: farm.name,
      });
    } else {
      form.reset();
    }
  }, [farm, isOpen, form.reset]);

  const { mutate, isPending } = useUpsertFarm({
    farmId: farm?.id,
  })

  const onSubmit = async (data: FarmFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso!",
          message: farm
            ? "Fazenda atualizada com sucesso!"
            : "Fazenda cadastrada com sucesso!",
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || "Ocorreu um erro ao salvar a fazenda. Por favor, tente novamente.",
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
          <DialogTitle>Fazendas</DialogTitle>
          <DialogDescription>
            {farm ? "Editar fazenda" : "Cadastrar fazenda"}
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
                      <Input {...field} placeholder="Fazenda Boa Esperança" />
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

export default UpsertFarmModal;
