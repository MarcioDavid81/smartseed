"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { OnboardingFormData, onboardingSchema } from "@/lib/schemas/onBoardingSchema";
import { useSmartToast } from "@/contexts/ToastContext";
import { FaSpinner } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function OnBoardingForm() {
  const router = useRouter();
  const { showToast } = useSmartToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      company: { name: "" },
      user: {
        name: "",
        email: "",
        password: "",
      },
    },
  });

  async function onSubmit(data: OnboardingFormData) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Erro ao realizar cadastro");
      }

      showToast({
        type: "success",
        title: "Sucesso",
        message: "Cadastro realizado com sucesso!",
      });
      router.push("/on-boarding/check-your-email");
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6 md:p-10">
      <CardContent className="space-y-4">
        <CardTitle className="text-2xl font-bold">
          Cadastre-se
        </CardTitle>
        <CardDescription>
          Crie uma conta gratuitamente para começar a gerenciar sua fazenda.
        </CardDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Empresa */}
            <FormField
              control={form.control}
              name="company.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da empresa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome usuário */}
            <FormField
              control={form.control}
              name="user.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="user.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Senha */}
            <FormField
              control={form.control}
              name="user.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={`w-full bg-green rounded-md transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : "Criar conta"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
