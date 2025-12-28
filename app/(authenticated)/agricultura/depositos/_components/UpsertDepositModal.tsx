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
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { IndustryDeposit } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { IndustryDepositFormData, industryDepositSchema } from "@/lib/schemas/industryDepositSchema";
import { useUpsertIndustryDeposit } from "@/queries/industry/use-upsert-deposit";
import { ApiError } from "@/lib/http/api-error";

interface UpsertIndustryDepositModalProps {
  industryDeposit?: IndustryDeposit;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertIndustryDepositModal = ({
  industryDeposit,
  isOpen,
  onClose,
}: UpsertIndustryDepositModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<IndustryDepositFormData>({
    resolver: zodResolver(industryDepositSchema),
    defaultValues: {
      name: industryDeposit?.name ?? "",
    },
  });

  useEffect(() => {
    if (industryDeposit) {
      form.reset({
        name: industryDeposit.name,
      });
    } else {
      form.reset();
    }
  }, [industryDeposit, isOpen, form]);

  const { mutate, isPending } = useUpsertIndustryDeposit({
      depositId: industryDeposit?.id,
    });

  const onSubmit = async (data: IndustryDepositFormData) => {
    mutate(data, {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Sucesso",
            message: industryDeposit
              ? "Depósito atualizado com sucesso!"
              : "Depósito cadastrado com sucesso!",
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
              industryDeposit ? "atualizar" : "criar"
            } depósito.`,
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
          <DialogTitle>Depósitos</DialogTitle>
          <DialogDescription>
            {industryDeposit ? "Editar depósito" : "Cadastrar depósito"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
                <div>
                  <Label>Nome</Label>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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

export default UpsertIndustryDepositModal;
