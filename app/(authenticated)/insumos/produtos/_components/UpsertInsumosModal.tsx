import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  PRODUCT_CLASS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from "../../../_constants/insumos";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useSmartToast } from "@/contexts/ToastContext";
import { InputProductFormData, inputProductSchema } from "@/lib/schemas/inputSchema";
import { ProductClass, Unit } from "@prisma/client";
import { useUpsertInputProduct } from "@/queries/input/use-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insumo } from "@/types";

interface UpsertInsumoModalProps {
  product?: Insumo;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertInsumosModal = ({
  product,
  isOpen,
  onClose,
}: UpsertInsumoModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<InputProductFormData>({
    resolver: zodResolver(inputProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      class: product?.class ?? ProductClass.OUTROS,
      unit: product?.unit ?? Unit.UN,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        class: product.class,
        unit: product.unit,
      });
    } else {
      form.reset();
    }
  }, [product, isOpen, form.reset]);

  const { mutate, isPending } = useUpsertInputProduct({
    inputProductId: product?.id,
  })

  const onSubmit = async (data: InputProductFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso!",
          message: product
            ? "Insumo atualizado com sucesso!"
            : "Insumo cadastrado com sucesso!",
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || "Ocorreu um erro ao salvar o insumo. Por favor, tente novamente.",
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
          <DialogTitle>Insumos</DialogTitle>
          <DialogDescription>
            {product ? "Editar insumo" : "Cadastrar insumo"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Ópera" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Fungicida de ação sistêmica" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma classe" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CLASS_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_UNIT_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
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

export default UpsertInsumosModal;
