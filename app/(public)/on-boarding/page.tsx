import { Metadata } from "next";
import { OnBoardingForm } from "./_components/OnBoardingForm";

export const metadata: Metadata = {
  title: "Cadastro",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://www.marciodavid.dev.br" },
  ],
};

export default function OnBoardingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-cover bg-center items-center justify-center p-6 md:p-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600747476229-ceb7f3493f60?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
      <div className="w-full max-w-sm md:max-w-3xl">
        <OnBoardingForm />
      </div>
    </div>
  )
}

