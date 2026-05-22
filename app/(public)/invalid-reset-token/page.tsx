import FuzzyText from "@/components/fuzzy-text";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link inválido",
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

export default function InvalidResetTokenPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <FuzzyText
          color="#F59E0B"
          fontWeight="bold"
          fontSize={64}
        >
          Link inválido
        </FuzzyText>

        <p className="mt-4 text-muted-foreground">
          Este link de recuperação é inválido ou expirou.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Por segurança, links de redefinição de senha possuem
          tempo limitado de validade.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2">
          <Button
            asChild
            className="bg-green hover:bg-green/90"
          >
            <Link href="/forgot-password">
              Solicitar novo link
            </Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="hover:text-green"
          >
            <Link
              href="/login"
              className="hover:no-underline"
            >
              Voltar para o login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}