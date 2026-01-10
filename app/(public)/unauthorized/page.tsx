import FuzzyText from "@/components/fuzzy-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso não autorizado",
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

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <FuzzyText
          color="#63B926"
          fontWeight="bold"
          fontSize={80}
        >
          Unauthorized
        </FuzzyText>
        <p className="mt-2 text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild variant="link" className="hover:text-green">
          <Link href="/dashboard" className="hover:no-underline">
            Voltar para o sistema!
          </Link>
        </Button>
      </div>
    </div>
  );
}
