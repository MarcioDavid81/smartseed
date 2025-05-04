"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { PRODUCT_TYPE_OPTIONS } from "../../_constants/products";
import { ProductType } from "@prisma/client";
import { getToken } from "@/lib/auth-client";

// Schema de validação
const cultivarSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  product: z.nativeEnum(ProductType, {
    required_error: "Produto obrigatório",
  })
});

type CultivarFormData = z.infer<typeof cultivarSchema>;

const UpsertCultivarSheetContent = ({
  closeSheet,
  onCreated,
}: {
  closeSheet: () => void;
  onCreated?: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<CultivarFormData>({
    resolver: zodResolver(cultivarSchema),
    defaultValues: {
      name: "",
      product: undefined,
    },
  });

  const onSubmit = async (data: CultivarFormData) => {
    setLoading(true);
    try {
      const token = getToken();
      console.log(token);

      const res = await fetch("/api/cultivars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao cadastrar cultivar");
      }

      toast.success("Cultivar cadastrada com sucesso!");
      onCreated?.();
      form.reset();
      closeSheet();
      // Aqui você pode acionar um refresh de lista ou fechar o Sheet, se quiser
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar cultivar");
    } finally {
      setLoading(false);
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <SheetContent className="bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SheetHeader>
            <SheetTitle>Adicionar uma nova cultivar?</SheetTitle>
          </SheetHeader>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultivar</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da cultivar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_TYPE_OPTIONS.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`relative overflow-hidden px-4 py-2 w-full font-medium border-2 border-green rounded-lg bg-transparent text-gray-800 hover:text-gray-50 transition-all duration-300 ease-in-out`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading}
          >
            <span className="relative flex items-center gap-2 z-10">
              {loading ? <FaSpinner className="animate-spin" /> : "Cadastrar"}
            </span>
            <div
              className={`absolute top-0 left-0 w-0 h-full bg-green transition-all duration-300 ease-in-out hover:w-full`}
              style={{
                width: isHovered ? "100%" : 0,
                transitionDuration: `300ms`,
              }}
            />
          </Button>
        </form>
      </Form>
    </SheetContent>
  );
};

export default UpsertCultivarSheetContent;
