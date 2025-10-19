"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { MultiPlotSelector } from "./MultiPlotSelector";
import { ProductType } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const safraSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  productType: z.nativeEnum(ProductType),
  startDate: z.string(),
  endDate: z.string().optional(),
  talhoesIds: z.array(z.string()).optional(),
});

type SafraFormData = z.infer<typeof safraSchema>;

interface Props {
  defaultValues?: SafraFormData;
  onSubmit: (data: SafraFormData) => void;
}

export function NewAgricultureCropYieldsForm({ defaultValues }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SafraFormData>({
    resolver: zodResolver(safraSchema),
    defaultValues,
  });

  const handleSubmit = async (data: SafraFormData) => {
  try {
    setLoading(true);
    const token = getToken();
    if (!token) {
      throw new Error("Token não encontrado");
    }
    const response = await fetch("/api/cycles", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar safra");
    }

    const result = await response.json();
    console.log("Safra criada com sucesso:", result);
    toast.success("Safra criada com sucesso!");
    form.reset();
  } catch (error) {
    console.error(error);
    toast.error("Erro ao criar safra");
  } finally {
    setLoading(false);
  }
};

  const handleClick = () => {
    router.push("/agricultura/safras");
  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}> 
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`Ex.: Soja 2025`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="productType"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tipo de Produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo de produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_TYPE_OPTIONS.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <span>{label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="startDate"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                      <Input {...field} type="date" />
                      <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="endDate"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Data de Fim</FormLabel>
                      <Input {...field} type="date" />
                      <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <FormField
              control={form.control}
              name="talhoesIds"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Talhões</FormLabel>
                    <MultiPlotSelector control={form.control} {...field} />
                    <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" className="md:w-1/4 w-full bg-green text-white mt-4" onClick={handleClick}>
                Voltar
              </Button>
              <Button type="submit" className="md:w-1/4 w-full bg-green text-white mt-4">
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
        </div>
      </form>
      </Form>
  );
}
