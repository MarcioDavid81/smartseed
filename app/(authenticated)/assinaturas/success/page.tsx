import { Metadata } from "next";
import NavItems from "../../_components/NavItems";
import FuzzyText from "@/components/fuzzy-text";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sucesso",
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

export default async function SuccessPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 items-center py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Sucesso</h1>
            <NavItems />
          </div>
          <div className="flex flex-col items-center justify-center">
            <FuzzyText
              color="#63B926"
              fontWeight="bold"
              fontSize={80}
            >
              Sucesso
            </FuzzyText>
            <p className="mt-2 text-muted-foreground">
              Seu plano foi ativado com sucesso.
            </p>
            <p className="mt-2">
              Obrigado por assinar. Agora você é um usuário premium e tem acesso a recursos ilimitados.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
