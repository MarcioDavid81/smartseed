"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export function EmailRecover() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(
    values: ForgotPasswordFormData,
  ) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      form.setError("root", {
        message:
          "Não foi possível enviar o email de recuperação",
      });
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <MailCheck className="size-12 text-green" />

          <CardTitle className="mt-4">
            Verifique seu email
          </CardTitle>

          <CardDescription>
            Se existir uma conta com este email,
            enviaremos instruções para redefinição
            de senha.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            asChild
            variant="link"
            className="w-full hover:text-green"
          >
            <Link
              href="/login"
              className="hover:no-underline"
            >
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu email para receber o link
          de redefinição de senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seuemail@empresa.com"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-green hover:bg-green/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              Enviar link de recuperação
            </Button>

            <Button
              asChild
              variant="link"
              className="w-full hover:text-green"
            >
              <Link
                href="/login"
                className="hover:no-underline"
              >
                Voltar para o login
              </Link>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}