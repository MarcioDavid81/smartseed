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
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default function OnBoardingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-cover bg-center items-center justify-center p-6 md:p-10" style={{ backgroundImage: "url('colheita.jpg')" }}>
      <div className="w-full max-w-sm md:max-w-3xl">
        <OnBoardingForm />
      </div>
    </div>
  )
}

