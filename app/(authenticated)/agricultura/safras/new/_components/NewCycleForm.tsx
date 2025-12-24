"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { MultiPlotSelector } from "./MultiPlotSelector";
import { getToken } from "@/lib/auth-client";
import { ProductType } from "@prisma/client";
import { toast } from "sonner";
import { CornerDownLeft, SaveIcon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_TYPE_OPTIONS } from "@/app/(authenticated)/_constants/products";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { useSmartToast } from "@/contexts/ToastContext";

const safraSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  productType: z.nativeEnum(ProductType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  talhoesIds: z.array(z.string()).optional(),
});

type SafraFormData = z.infer<typeof safraSchema>;

interface SafraFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function SafraForm({ initialData, isEditing }: SafraFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useSmartToast();

  const form = useForm<SafraFormData>({
    resolver: zodResolver(safraSchema),
    defaultValues: {
      name: initialData?.name || "",
      productType: initialData?.productType || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(),
      talhoesIds: initialData?.talhoes?.map((t: any) => t.talhaoId) || [],
    },
  });

  async function onSubmit(values: SafraFormData) {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/cycles/${initialData.id}`
      : "/api/cycles";
    const token = getToken()
    setLoading(true);
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      showToast({
        type: "success",
        title: "Sucesso",
        message: "Safra salva com sucesso!",
      });
      router.push("/agricultura/safras");
    } else {
      showToast({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar safra",
      });
    }
    setLoading(false);
  }

  const handleReturn = () => {
    router.push("/agricultura/safras");
  }

  return (
    <ScrollArea className="md:h-[calc(100vh-200px)]">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}> 
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
                    <Input {...field} placeholder={`Ex.: Soja 2025`} className="font-light"/>
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
                        <FormControl className="font-light">
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
                      <DatePicker {...field} />
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
                      <DatePicker {...field} />
                      <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <FormField
              control={form.control}
              name="talhoesIds"
              render={({field}) => (
                <FormItem className="space-y-2">
                  <FormLabel>Talhões</FormLabel>
                  <div className="w-full">
                    <MultiPlotSelector control={form.control} {...field} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button type="button" className=" bg-green text-white mt-4" onClick={handleReturn}>
                <CornerDownLeft size={20} />
                Voltar
              </Button>
              <Button type="submit" className=" bg-green text-white mt-4" disabled={loading}>
                <SaveIcon size={20} />
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
        </div>
      </form>
      </Form>
      </ScrollArea>
  );
}
