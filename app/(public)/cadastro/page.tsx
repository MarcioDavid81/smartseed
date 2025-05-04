import { SignInForm } from "@/components/signin-form";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default function CadastroPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignInForm />
      </div>
    </div>
  );
}
